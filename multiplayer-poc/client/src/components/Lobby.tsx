import React, { useState } from 'react';
import { playSFX } from '../utils/sfx';

interface LobbyProps {
  onCreate: (name: string, avatar: string) => void;
  onJoin: (code: string, name: string, avatar: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const Lobby: React.FC<LobbyProps> = ({ onCreate, onJoin, isLoading, error }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('guiyermion.png');
  const [mode, setMode] = useState<'initial' | 'create' | 'join'>('initial');

  const avatars = [
    'guiyermion.png', 'fassbi.png', 'fenixped.png', 'ismaelo.png',
    'mono.png', 'selidios.png', 'sergigi.png', 'velas.png'
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), selectedAvatar);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (name.trim() && cleanCode) {
      onJoin(cleanCode, name.trim(), selectedAvatar);
    }
  };

  if (mode === 'initial') {
    return (
      <div className="glass glass-card lobby-container">
        <img
          src="/portada.png"
          alt="Guilleverse"
          style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '2px solid var(--primary-gold)' }}
        />
        <h1>
          Guilleverse
          <p style={{ color: 'var(--magic-cyan)', fontSize: '1.5rem', marginTop: '-0.5rem' }}>Web Edition</p>
        </h1>
        <p style={{ marginBottom: '2rem', opacity: 0.7 }}>Elige cómo quieres empezar</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => setMode('create')}>Crear Partida</button>
          <button onClick={() => setMode('join')} className="secondary">Unirse por Código</button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass glass-card lobby-container" style={{ position: 'relative' }}>
      <button
        onClick={() => {
          playSFX('click');
          setMode('initial');
        }}
        className="btn-back"
        style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}
      >
        ← Volver
      </button>
      <h1>{mode === 'create' ? 'Crear Partida' : 'Unirse a Partida'}</h1>
      
      {error && (
        <div style={{ 
          background: 'rgba(255, 68, 68, 0.15)', 
          color: '#ff4444', 
          padding: '0.8rem', 
          borderRadius: '0.5rem', 
          fontSize: '0.85rem',
          border: '1px solid #ff4444',
          marginBottom: '1rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={mode === 'create' ? handleCreate : handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
        <input
          type="text"
          placeholder="Tu apodo..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />

        <div className="avatar-selector">
          <p style={{ fontSize: '0.9rem', marginBottom: '0.8rem', opacity: 0.8 }}>Selecciona tu personaje:</p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '0.8rem',
            background: 'rgba(0,0,0,0.2)',
            padding: '1rem',
            borderRadius: '0.5rem'
          }}>
            {avatars.map(av => (
              <div 
                key={av}
                onClick={() => {
                  playSFX('click');
                  setSelectedAvatar(av);
                }}
                style={{
                  cursor: 'pointer',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  border: `3px solid ${selectedAvatar === av ? 'var(--magic-cyan)' : 'transparent'}`,
                  transition: 'all 0.2s',
                  boxShadow: selectedAvatar === av ? '0 0 15px var(--magic-cyan)' : 'none'
                }}
              >
                <img src={`/avatars/${av}`} alt={av} style={{ width: '100%', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>

        {mode === 'join' && (
          <input
            type="text"
            placeholder="Código de la sala (ej. ABCD)..."
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={4}
            required
          />
        )}

        <button type="submit" style={{ width: '100%' }} disabled={isLoading}>
          {isLoading ? (
            <span>Conectando...</span>
          ) : (
            mode === 'create' ? 'Comenzar como Host' : 'Unirse ahora'
          )}
        </button>
      </form>
    </div>
  );
};
