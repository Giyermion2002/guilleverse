import React, { useState } from 'react';
import { playSFX } from '../../utils/sfx';
import { Button } from '../Common/Button/Button';
import { TextInput } from '../Common/TextInput/TextInput';
import { ErrorBox } from '../Common/ErrorBox/ErrorBox';
import { AvatarCarousel } from './AvatarCarousel/AvatarCarousel';
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
 * Componente Lobby: gestiona el registro de jugadores y la navegación entre
 * las pantallas de inicio, creación y unión a salas de juego.
 * La lógica del carrusel de avatares está completamente delegada a AvatarCarousel.
 *
 * @param {LobbyProps} props - Propiedades del componente.
 * @returns {JSX.Element} La interfaz del lobby.
 */
export const Lobby: React.FC<LobbyProps> = ({ onCreate, onJoin, isLoading, error }) => {
  const [name, setName]   = useState('');
  const [code, setCode]   = useState('');
  const [mode, setMode]   = useState<'initial' | 'create' | 'join'>('initial');
  /** Avatar seleccionado actualmente; se actualiza desde AvatarCarousel vía onSelect. */
  const [selectedAvatar, setSelectedAvatar] = useState('guiyermion.png');

  /**
   * Envía la solicitud para crear una nueva sala.
   * @param {React.FormEvent} e - Evento del formulario.
   */
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onCreate(name.trim(), selectedAvatar);
  };

  /**
   * Envía la solicitud para unirse a una sala existente.
   * @param {React.FormEvent} e - Evento del formulario.
   */
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (name.trim() && cleanCode) onJoin(cleanCode, name.trim(), selectedAvatar);
  };

  // ── Vista inicial ─────────────────────────────────────────────────────────
  if (mode === 'initial') {
    return (
      <div className="glass glass-card lobby-container">
        <img src="/portada.png" alt="Guilleverse" className="banner-img" />
        <h1>
          Guilleverse
          <p>Web Edition</p>
        </h1>
        <p className="lobby-subtitle">Elige cómo quieres empezar</p>
        <div className="initial-actions">
          <Button onClick={() => setMode('create')}>Crear Partida</Button>
          <Button variant="secondary" onClick={() => setMode('join')}>Unirse por Código</Button>
        </div>
      </div>
    );
  }

  // ── Vista de formulario (Crear o Unirse) ──────────────────────────────────
  return (
    <div className="glass glass-card lobby-container lobby-container--form">
      <Button
        variant="ghost"
        onClick={() => { playSFX('click'); setMode('initial'); }}
      >
        ← Volver
      </Button>

      <h1>{mode === 'create' ? 'Crear Partida' : 'Unirse a Partida'}</h1>

      <ErrorBox message={error} />

      <form onSubmit={mode === 'create' ? handleCreate : handleJoin} className="lobby-form">
        <TextInput
          placeholder="Tu apodo..."
          value={name}
          onChange={setName}
          autoFocus
          required
        />

        {/* Carrusel de selección de personaje — lógica completamente encapsulada */}
        <AvatarCarousel onSelect={setSelectedAvatar} />

        {mode === 'join' && (
          <TextInput
            placeholder="Código de la sala (ej. ABCD)..."
            value={code}
            onChange={(v) => setCode(v.toUpperCase())}
            maxLength={4}
            required
          />
        )}

        <Button type="submit" className="btn-submit" disabled={isLoading} loading={isLoading}>
          {mode === 'create' ? 'Comenzar como Host' : 'Unirse ahora'}
        </Button>
      </form>
    </div>
  );
};
