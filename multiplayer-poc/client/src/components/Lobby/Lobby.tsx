import React, { useState } from 'react';
import { playSFX } from '../../utils/sfx';
import './Lobby.scss';

/**
 * Interfaz que define las propiedades del componente Lobby.
 */
interface LobbyProps {
  /** Función que se ejecuta al crear una nueva partida. */
  onCreate: (name: string, avatar: string) => void;
  /** Función que se ejecuta al intentar unirse a una partida existente. */
  onJoin: (code: string, name: string, avatar: string) => void;
  /** Estado de carga que indica si hay una petición de red en curso. */
  isLoading?: boolean;
  /** Mensaje de error para mostrar en la interfaz si la conexión falla. */
  error?: string | null;
}

/**
 * Componente Lobby: Gestiona el registro de jugadores, la selección de avatares 
 * y la creación/unión a salas de juego.
 * 
 * @param {LobbyProps} props - Propiedades del componente.
 * @returns {JSX.Element} El componente de la interfaz de usuario del lobby.
 */
export const Lobby: React.FC<LobbyProps> = ({ onCreate, onJoin, isLoading, error }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('guiyermion.png');
  const [mode, setMode] = useState<'initial' | 'create' | 'join'>('initial');

  const avatars = [
    'guiyermion.png', 'fassbi.png', 'fenixped.png', 'ismaelo.png',
    'mono.png', 'selidios.png', 'sergigi.png', 'velas.png'
  ];

  /**
   * Maneja el envío del formulario de creación de sala.
   * @param {React.FormEvent} e - Evento del formulario.
   */
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), selectedAvatar);
    }
  };

  /**
   * Maneja el envío del formulario para unirse a una sala.
   * @param {React.FormEvent} e - Evento del formulario.
   */
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (name.trim() && cleanCode) {
      onJoin(cleanCode, name.trim(), selectedAvatar);
    }
  };

  // Vista inicial con opciones de Crear o Unirse
  if (mode === 'initial') {
    return (
      <div className="glass glass-card lobby-container">
        <img
          src="/portada.png"
          alt="Guilleverse"
          className="banner-img"
        />
        <h1>
          Guilleverse
          <p>Web Edition</p>
        </h1>
        <p style={{ marginBottom: '2rem', opacity: 0.7 }}>Elige cómo quieres empezar</p>
        <div className="initial-actions">
          <button onClick={() => setMode('create')}>Crear Partida</button>
          <button onClick={() => setMode('join')} className="secondary">Unirse por Código</button>
        </div>
      </div>
    );
  }

  // Vista de formulario (Crear o Unirse)
  return (
    <div className="glass glass-card lobby-container">
      <button
        onClick={() => {
          playSFX('click');
          setMode('initial');
        }}
        className="btn-back"
      >
        ← Volver
      </button>
      
      <h1>{mode === 'create' ? 'Crear Partida' : 'Unirse a Partida'}</h1>
      
      {error && (
        <div className="error-box">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={mode === 'create' ? handleCreate : handleJoin} className="lobby-form">
        <input
          type="text"
          placeholder="Tu apodo..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />

        <div className="avatar-section">
          <p className="section-label">Selecciona tu personaje:</p>
          <div className="avatar-grid">
            {avatars.map(av => (
              <div 
                key={av}
                onClick={() => {
                  playSFX('click');
                  setSelectedAvatar(av);
                }}
                className={`avatar-item ${selectedAvatar === av ? 'selected' : ''}`}
              >
                <img src={`/avatars/${av}`} alt={av} />
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
