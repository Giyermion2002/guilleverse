import React, { useState, useEffect } from 'react';
import { playSFX } from '../utils/sfx';

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

interface GameTableProps {
  roomCode: string;
  isHost: boolean;
  gameStarted: boolean;
  players: Player[];
  actions: Action[];
  messages: ChatMessage[];
  onStartGame: () => void;
  onPlayCard: (card: { type: string, value: string }) => void;
  onSendMessage: (text: string) => void;
}

export const GameTable: React.FC<GameTableProps> = ({
  roomCode, isHost, gameStarted, players, actions, messages, onStartGame, onPlayCard, onSendMessage
}) => {
  const [chatInput, setChatInput] = useState('');
  const [lastAction, setLastAction] = useState<Action | null>(null);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      playSFX('click');
      onSendMessage(chatInput);
      setChatInput('');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Código copiado: ' + roomCode);
  };

  useEffect(() => {
    if (actions.length > 0) {
      setLastAction(actions[0]); // Most recent is first
    }
  }, [actions]);

  return (
    <div className="game-layout" style={{ 
      display: 'grid', 
      gridTemplateColumns: '280px 520px 350px', 
      gap: '1.2rem', 
      width: 'fit-content',
      height: '65vh',
      margin: '0 auto',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      {/* COLUMN 1: PLAYERS */}
      <div className="sidebar left-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
        <div className="glass glass-card" style={{ flex: 1, padding: '1rem', overflow: 'hidden', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginTop: 0, fontSize: '1rem', color: 'var(--primary-gold)', textAlign: 'center', flexShrink: 0 }}>JUGADORES</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none' }}>
            {players.map((p, index) => (
              <li key={p.id} style={{
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '0.6rem',
                borderRadius: '0.6rem',
                background: index === 0 && gameStarted ? 'rgba(0, 251, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                border: index === 0 && gameStarted ? '1px solid var(--magic-cyan)' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: index === 0 && gameStarted ? '0 0 15px rgba(0, 251, 255, 0.2)' : 'none'
              }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary-gold)', flexShrink: 0 }}>
                  <img src={`/avatars/${p.avatar}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    {(p as any).isHost && (
                      <span style={{ 
                        fontSize: '0.6rem', 
                        background: 'var(--primary-gold)', 
                        color: 'black', 
                        padding: '1px 4px', 
                        borderRadius: '3px',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>HOST</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>
                    {index === 0 && gameStarted ? '✨ ACTIVO' : 'CONECTADO'}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* COLUMN 2: MAIN TABLE */}
      <div className="glass glass-card main-table" style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Mesa de Juego</h2>
          <div className="glass" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>SALA: <strong style={{ color: 'var(--magic-cyan)' }}>{roomCode}</strong></span>
            <button onClick={copyCode} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>Copiar</button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {isHost && !gameStarted && (
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              {players.length < 3 && (
                <p style={{ color: 'var(--magic-cyan)', fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.8 }}>
                  Esperando a más jugadores (Mínimo 3)...
                </p>
              )}
              <button
                onClick={onStartGame}
                disabled={players.length < 3}
                style={{ padding: '1.2rem 4rem', fontSize: '1.4rem', opacity: players.length < 3 ? 0.5 : 1 }}
              >
                EMPEZAR PARTIDA
              </button>
            </div>
          )}

          {gameStarted && (
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{
                background: 'rgba(0, 251, 255, 0.1)',
                padding: '0.6rem 2rem',
                borderRadius: '2rem',
                color: 'var(--magic-cyan)',
                fontSize: '1rem',
                border: '1px solid var(--magic-cyan)',
                boxShadow: '0 0 20px rgba(0, 251, 255, 0.3)',
                fontFamily: 'serif',
                letterSpacing: '2px'
              }}>
                PARTIDA EN CURSO
              </span>
            </div>
          )}

          <div className="table-center" style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            {lastAction ? (
              <div className="action-popup glass" style={{
                padding: '2rem 4rem',
                animation: 'fadeIn 0.5s ease-out',
                border: '2px solid var(--primary-gold)',
                background: 'rgba(0,0,0,0.4)'
              }}>
                <strong style={{ color: 'var(--primary-gold)', fontSize: '1.4rem' }}>{lastAction.playerName}</strong>
                <span style={{ marginLeft: '0.8rem', fontSize: '1.2rem' }}>{lastAction.action}</span>
              </div>
            ) : (
              <p style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '1.3rem' }}>Esperando movimientos...</p>
            )}
          </div>
        </div>

        <div className="player-hand" style={{
          paddingBottom: '2rem',
          display: 'flex',
          gap: '1.2rem',
          justifyContent: 'center'
        }}>
          {['Espada', 'Copa', 'Oro', 'Basto'].map(type => {
            const colors: Record<string, string> = {
              'Espada': '#00fbff',
              'Copa': '#ff00cc',
              'Oro': '#ffd700',
              'Basto': '#4caf50'
            };
            return (
              <button
                key={type}
                className="glass-card card-btn"
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  borderColor: colors[type],
                  color: colors[type],
                  boxShadow: `0 6px 0 ${colors[type]}44`,
                  background: 'rgba(0,0,0,0.3)'
                }}
                onClick={() => {
                  playSFX('click');
                  onPlayCard({ type, value: 'As' });
                }}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* COLUMN 3: CHAT */}
      <div className="sidebar right-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
        <div className="glass glass-cardChat" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(10, 26, 46, 0.9)',
          borderRadius: '1rem',
          border: '2px solid var(--secondary-gold)',
          padding: '1.2rem',
          textAlign: 'left',
          overflow: 'hidden'
        }}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem', color: 'var(--secondary-gold)', textAlign: 'center', flexShrink: 0 }}>MENSAJES</h3>
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', marginBottom: '1rem', paddingRight: '0.5rem' }}>
            {messages.length === 0 && <p style={{ fontSize: '0.9rem', opacity: 0.5, textAlign: 'center' }}>No hay mensajes aún...</p>}
            {messages.map((m) => (
              <div key={m.id} style={{ marginBottom: '0.8rem', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--primary-gold)', fontWeight: 'bold' }}>{m.sender}: </span>
                <span style={{ wordBreak: 'break-word' }}>{m.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, width: '100%' }}>
            <input
              type="text"
              placeholder="Mensaje..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
            />
            <button type="submit" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', flexShrink: 0, border: 'none' }}>ENVIAR</button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .card-btn:active {
          transform: translateY(4px);
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};
