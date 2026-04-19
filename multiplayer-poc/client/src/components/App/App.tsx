import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { playSFX } from '../../utils/sfx';
import { Lobby } from '../Lobby/Lobby';
import { GameTable } from '../GameTable/GameTable';
import { AudioControl } from '../AudioControl/AudioControl';
import './App.scss';

// Inicialización del socket fuera del componente para evitar reconexiones múltiples en cada render
const socket: Socket = io('http://localhost:3001');

/**
 * Interfaz que representa a un jugador conectado.
 */
interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost?: boolean;
}

/**
 * Interfaz que representa un mensaje recibido en el chat.
 */
interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
}

/**
 * Interfaz que representa una acción registrada en el historial del juego.
 */
interface Action {
  playerName: string;
  action: string;
  timestamp: string;
}

/**
 * Componente raíz de la aplicación.
 * Gestiona el estado global de la conexión, los jugadores y la lógica de navegación entre 
 * el Lobby y la Mesa de Juego.
 * 
 * @returns {JSX.Element} El componente principal de la aplicación.
 */
function App() {
  const [joined, setJoined] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Escuchador: El usuario se ha unido exitosamente a una sala
    socket.on('joined-room', ({ code, isHost }: { code: string, isHost: boolean }) => {
      playSFX('join');
      setRoomCode(code);
      setIsHost(isHost);
      setJoined(true);
      setIsConnecting(false);
    });

    // Escuchador: Actualización de la lista de jugadores conectados
    socket.on('player-list', (list: Player[]) => {
      setPlayers(list);
    });

    // Escuchador: Notificación de una nueva acción en el juego (ej. carta jugada)
    socket.on('new-action', (action: Action) => {
      setActions(prev => [action, ...prev]);
    });

    // Escuchador: Recepción de un mensaje de chat
    socket.on('chat-message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    // Escuchador: El Host ha iniciado la partida
    socket.on('game-started', () => {
      setGameStarted(true);
    });

    // Escuchador: El usuario actual ha sido promovido a Host (si el anterior se fue)
    socket.on('became-host', () => {
      setIsHost(true);
    });

    // Escuchador: Errores del servidor (ej. sala no existe)
    socket.on('error', (msg: string) => {
      setErrorMessage(msg);
      setIsConnecting(false);
    });

    // Limpieza de escuchadores al desmontar el componente
    return () => {
      socket.off('joined-room');
      socket.off('player-list');
      socket.off('new-action');
      socket.off('chat-message');
      socket.off('game-started');
      socket.off('became-host');
      socket.off('error');
    };
  }, []);

  /**
   * Envía la solicitud al servidor para crear una nueva sala.
   * @param {string} name - El apodo del jugador.
   * @param {string} avatar - El nombre del archivo del avatar seleccionado.
   */
  const handleCreate = (name: string, avatar: string) => {
    setErrorMessage(null);
    setIsConnecting(true);
    socket.emit('create-room', { name, avatar });
  };

  /**
   * Envía la solicitud al servidor para unirse a una sala existente mediante código.
   * @param {string} code - Código de 4 caracteres de la sala.
   * @param {string} name - El apodo del jugador.
   * @param {string} avatar - El nombre del archivo del avatar seleccionado.
   */
  const handleJoin = (code: string, name: string, avatar: string) => {
    setErrorMessage(null);
    setIsConnecting(true);
    socket.emit('join-room', { code, name, avatar });
  };

  /**
   * Envía un mensaje de chat a todos los jugadores de la sala.
   * @param {string} text - El contenido del mensaje.
   */
  const handleSendMessage = (text: string) => {
    socket.emit('send-chat-message', { code: roomCode, message: text });
  };

  /**
   * (Solo para el Host) Envía la señal para comenzar la partida.
   */
  const handleStartGame = () => {
    socket.emit('start-game', roomCode);
  };

  /**
   * Envía la acción de jugar una carta al servidor.
   * @param {Object} card - Objeto con el tipo y valor de la carta.
   */
  const handlePlayCard = (card: { type: string, value: string }) => {
    socket.emit('play-card', { code: roomCode, card });
  };

  return (
    <main>
      <AudioControl />
      {!joined ? (
        <Lobby 
          onCreate={handleCreate} 
          onJoin={handleJoin} 
          isLoading={isConnecting} 
          error={errorMessage}
        />
      ) : (
        <GameTable 
          roomCode={roomCode}
          isHost={isHost}
          gameStarted={gameStarted}
          players={players} 
          actions={actions} 
          messages={messages}
          onStartGame={handleStartGame}
          onPlayCard={handlePlayCard} 
          onSendMessage={handleSendMessage}
        />
      )}
    </main>
  );
}

export default App;
