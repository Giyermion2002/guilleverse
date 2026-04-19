import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Default Vite port
    methods: ["GET", "POST"]
  }
});

interface Player {
  id: string;
  name: string;
  avatar: string;
}

interface Room {
  code: string;
  hostId: string;
  players: Map<string, Player>;
  gameStarted: boolean;
}

const rooms: Map<string, Room> = new Map();

// Helper to generate a room code
const generateCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create-room', ({ name, avatar }: { name: string, avatar: string }) => {
    let code = generateCode();
    while (rooms.has(code)) code = generateCode(); // Ensure uniqueness

    const room: Room = {
      code,
      hostId: socket.id,
      players: new Map([[socket.id, { id: socket.id, name, avatar }]]),
      gameStarted: false
    };

    rooms.set(code, room);
    socket.join(code);
    
    socket.emit('joined-room', { code, isHost: true });
    
    const playerList = Array.from(room.players.values()).map(p => ({
      ...p,
      isHost: p.id === room.hostId
    }));
    io.to(code).emit('player-list', playerList);
    console.log(`Room created: ${code} by ${name} (Avatar: ${avatar})`);
  });

  socket.on('join-room', ({ code, name, avatar }: { code: string, name: string, avatar: string }) => {
    const room = rooms.get(code.toUpperCase());
    if (!room) {
      socket.emit('error', 'La sala no existe');
      return;
    }

    const player: Player = { id: socket.id, name, avatar };
    room.players.set(socket.id, player);
    socket.join(code.toUpperCase());

    socket.emit('joined-room', { code: room.code, isHost: false });
    // Send list of players including host status
    const playerList = Array.from(room.players.values()).map(p => ({
      ...p,
      isHost: p.id === room.hostId
    }));
    io.to(room.code).emit('player-list', playerList);
    
    if (room.gameStarted) {
      socket.emit('game-started');
    }

    console.log(`${name} joined room: ${room.code} (Avatar: ${avatar})`);
  });

  socket.on('start-game', (code: string) => {
    const room = rooms.get(code.toUpperCase());
    if (room && room.hostId === socket.id) {
      if (room.players.size < 3) {
        socket.emit('error', 'Necesitas al menos 3 jugadores para empezar');
        return;
      }
      room.gameStarted = true;
      io.to(room.code).emit('game-started');
      console.log(`Game started in room: ${room.code}`);
    }
  });

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

  socket.on('disconnecting', () => {
    socket.rooms.forEach(code => {
      const room = rooms.get(code);
      if (room) {
        room.players.delete(socket.id);
        if (room.players.size === 0) {
          rooms.delete(code);
          console.log(`Room ${code} deleted (empty)`);
        } else {
          // If host left, assign new host
          if (room.hostId === socket.id) {
            const nextHost = room.players.keys().next().value;
            if (nextHost) {
              room.hostId = nextHost;
              io.to(nextHost).emit('became-host');
            }
          }
          io.to(code).emit('player-list', Array.from(room.players.values()).map(p => ({
            ...p,
            isHost: p.id === room.hostId
          })));
        }
      }
    });
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
