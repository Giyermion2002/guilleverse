import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { playSFX } from './utils/sfx';
import { Lobby } from './components/Lobby';
import { GameTable } from './components/GameTable';
import './App.css';

// Initialize socket outside component to prevent multiple connections
const socket: Socket = io('http://localhost:3001');

interface Player {
  id: string;
  name: string;
  avatar: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
}

interface Action {
  playerName: string;
  action: string;
  timestamp: string;
}

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
    socket.on('joined-room', ({ code, isHost }: { code: string, isHost: boolean }) => {
      playSFX('join');
      setRoomCode(code);
      setIsHost(isHost);
      setJoined(true);
    });

    socket.on('player-list', (list: Player[]) => {
      setPlayers(list);
    });

    socket.on('new-action', (action: Action) => {
      setActions(prev => [action, ...prev]);
    });

    socket.on('chat-message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('game-started', () => {
      setGameStarted(true);
    });

    socket.on('became-host', () => {
      setIsHost(true);
    });

    socket.on('error', (msg: string) => {
      setErrorMessage(msg);
      setIsConnecting(false);
    });

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

  const handleCreate = (name: string, avatar: string) => {
    setErrorMessage(null);
    setIsConnecting(true);
    socket.emit('create-room', { name, avatar });
  };

  const handleJoin = (code: string, name: string, avatar: string) => {
    setErrorMessage(null);
    setIsConnecting(true);
    socket.emit('join-room', { code, name, avatar });
  };

  const handleSendMessage = (text: string) => {
    socket.emit('send-chat-message', { code: roomCode, message: text });
  };

  const handleStartGame = () => {
    socket.emit('start-game', roomCode);
  };

  const handlePlayCard = (card: { type: string, value: string }) => {
    socket.emit('play-card', { code: roomCode, card });
  };

  return (
    <main>
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
