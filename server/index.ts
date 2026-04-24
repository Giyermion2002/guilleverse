import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Puerto por defecto de Vite
    methods: ["GET", "POST"]
  }
});

/**
 * Representa los datos de un jugador en la memoria del servidor.
 */
interface Player {
  /** ID único del socket del jugador. */
  id: string;
  /** Nombre o apodo elegido por el jugador. */
  name: string;
  /** Nombre del archivo del avatar seleccionado. */
  avatar: string;
}

/**
 * Colores de minijuego disponibles en el Guilleverse.
 */
const GAME_COLORS = ['amarillo', 'rojo', 'verde', 'azul'] as const;
/** Tipo de color de minijuego. */
type GameColor = typeof GAME_COLORS[number];

/**
 * Representa una sala de juego.
 */
interface Room {
  /** Código único de 4 caracteres de la sala. */
  code: string;
  /** ID del socket del jugador que ostenta el rol de Host. */
  hostId: string;
  /** Mapa de jugadores conectados, indexado por su socket ID. */
  players: Map<string, Player>;
  /** Estado de la partida (si ha comenzado o sigue en lobby). */
  gameStarted: boolean;
  /** Color de minijuego elegido al iniciar la partida. */
  gameColor?: GameColor;
  /**
   * Rastrea jugadores que han salido recientemente, indexados por avatar.
   * Permite detectar reconexiones (misma persona, posible cambio de nombre).
   */
  departedPlayers: Map<string, { name: string; avatar: string }>;
}

/** Almacenamiento volátil de salas activas. */
const rooms: Map<string, Room> = new Map();

/**
 * Genera un código aleatorio de 4 caracteres alfanuméricos en mayúsculas.
 * @returns {string} Código de sala generado.
 */
const generateCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

/**
 * Genera un mensaje de sistema con los campos estándar de chat-message.
 * @param {string} text - Texto del mensaje.
 * @returns Objeto listo para emitir como 'chat-message'.
 */
const makeSystemMessage = (text: string) => ({
  id: Math.random().toString(36).substr(2, 9),
  sender: '__system__',
  avatar: '',
  text,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  isSystem: true,
});

/**
 * Gestiona la salida de un jugador de una sala específica.
 * Guarda los datos del jugador en `departedPlayers` para detectar reconexiones futuras.
 * @param {Socket} socket - Socket del jugador.
 * @param {string} code - Código de la sala.
 */
const handlePlayerLeave = (socket: Socket, code: string) => {
  const room = rooms.get(code);
  if (!room) return;

  const departingPlayer = room.players.get(socket.id);

  room.players.delete(socket.id);
  socket.leave(code);

  if (room.players.size === 0) {
    rooms.delete(code);
    console.log(`Sala ${code} eliminada por falta de jugadores`);
  } else {
    // Si el que se fue era el Host, elegir uno nuevo automáticamente
    if (room.hostId === socket.id) {
      const nextHost = room.players.keys().next().value;
      if (nextHost) {
        room.hostId = nextHost;
        io.to(nextHost).emit('became-host');
      }
    }

    // Notificar lista actualizada tras la salida
    io.to(code).emit('player-list', Array.from(room.players.values()).map(p => ({
      ...p,
      isHost: p.id === room.hostId
    })));

    // Registrar jugador como salido y emitir mensaje de sistema
    if (departingPlayer) {
      room.departedPlayers.set(departingPlayer.avatar, {
        name: departingPlayer.name,
        avatar: departingPlayer.avatar,
      });
      io.to(code).emit('chat-message', makeSystemMessage(
        `${departingPlayer.name} ha abandonado la partida`
      ));
    }
  }
};

/**
 * Manejador principal de conexiones de Socket.io.
 */
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  /**
   * Evento: Creación de una nueva sala por parte de un usuario (Host).
   */
  socket.on('create-room', ({ name, avatar }: { name: string, avatar: string }) => {
    let code = generateCode();
    while (rooms.has(code)) code = generateCode(); // Garantizar unicidad

    const room: Room = {
      code,
      hostId: socket.id,
      players: new Map([[socket.id, { id: socket.id, name, avatar }]]),
      gameStarted: false,
      departedPlayers: new Map(),
    };

    rooms.set(code, room);
    socket.join(code);

    // Notificar al creador que la sala está lista
    socket.emit('joined-room', { code, isHost: true });

    // Emitir lista inicial de jugadores
    const playerList = Array.from(room.players.values()).map(p => ({
      ...p,
      isHost: p.id === room.hostId
    }));
    io.to(code).emit('player-list', playerList);

    console.log(`Sala creada: ${code} por ${name} (Avatar: ${avatar})`);
  });

  /**
   * Evento: Un usuario intenta unirse a una sala existente mediante código.
   */
  socket.on('join-room', ({ code, name, avatar }: { code: string, name: string, avatar: string }) => {
    const room = rooms.get(code.toUpperCase());

    if (!room) {
      socket.emit('error', 'La sala no existe');
      return;
    }

    // Validar que el nombre no esté ya en uso en esta sala
    const nameTaken = Array.from(room.players.values()).some(
      p => p.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (nameTaken) {
      socket.emit('error', `El nombre "${name}" ya está en uso en esta sala`);
      return;
    }

    const player: Player = { id: socket.id, name, avatar };
    room.players.set(socket.id, player);
    socket.join(code.toUpperCase());

    socket.emit('joined-room', { code: room.code, isHost: false });

    // Actualizar lista de jugadores para todos en la sala
    const playerList = Array.from(room.players.values()).map(p => ({
      ...p,
      isHost: p.id === room.hostId
    }));
    io.to(room.code).emit('player-list', playerList);

    // Sincronizar estado si la partida ya empezó — isNew: false para saltar la ruleta
    if (room.gameStarted) {
      socket.emit('game-started', { color: room.gameColor, isNew: false });
    }

    // Emitir mensaje de sistema: unión o reconexion
    const departed = room.departedPlayers.get(avatar);
    let systemText: string;
    if (departed) {
      // Mismo avatar → reconexión
      room.departedPlayers.delete(avatar);
      systemText = departed.name === name
        ? `${name} se ha reconectado a la partida`
        : `${name} se ha reconectado a la partida (antes: ${departed.name})`;
    } else {
      systemText = `${name} se ha unido a la partida`;
    }
    io.to(room.code).emit('chat-message', makeSystemMessage(systemText));

    console.log(`${name} se unió a la sala: ${room.code} (Avatar: ${avatar})`);
  });

  /**
   * Evento: El Host inicia formalmente la partida.
   */
  socket.on('start-game', (code: string) => {
    const room = rooms.get(code.toUpperCase());
    if (room && room.hostId === socket.id) {
      // Validar quórum mínimo
      if (room.players.size < 3) {
        socket.emit('error', 'Necesitas al menos 3 jugadores para empezar');
        return;
      }
      // Elegir color de minijuego aleatoriamente
      const color: GameColor = GAME_COLORS[Math.floor(Math.random() * GAME_COLORS.length)];
      room.gameStarted = true;
      room.gameColor   = color;
      // isNew: true — todos los clientes en sala verán la ruleta
      io.to(room.code).emit('game-started', { color, isNew: true });
      console.log(`Partida iniciada en la sala: ${room.code} — Modo: ${color}`);
    }
  });

  /**
   * Evento: Un jugador decide salir voluntariamente de la sala hacia el Lobby.
   */
  socket.on('leave-room', (code: string) => {
    handlePlayerLeave(socket, code.toUpperCase());
    console.log(`Usuario ${socket.id} salió voluntariamente de la sala ${code}`);
  });

  /**
   * Evento: Envío de un mensaje de chat.
   */
  socket.on('send-chat-message', ({ code, message }: { code: string, message: string }) => {
    const room = rooms.get(code.toUpperCase());
    const player = room?.players.get(socket.id);

    if (room && player) {
      io.to(room.code).emit('chat-message', {
        id: Math.random().toString(36).substr(2, 9),
        sender: player.name,
        avatar: player.avatar,
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  });

  /**
   * Evento: Un jugador realiza una acción de juego (ej. jugar una carta).
   */
  socket.on('play-card', ({ code, card }: { code: string, card: { type: string, value: string } }) => {
    const room = rooms.get(code.toUpperCase());
    const player = room?.players.get(socket.id);

    if (player && room) {
      io.to(room.code).emit('new-action', {
        playerName: player.name,
        action: `jugó una carta ${card.type} ${card.value}`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  });

  /**
   * Evento: Gestión de la desconexión total del socket y limpieza.
   */
  socket.on('disconnecting', () => {
    socket.rooms.forEach(code => {
      handlePlayerLeave(socket, code);
    });
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor de Guilleverse corriendo en http://localhost:${PORT}`);
});
