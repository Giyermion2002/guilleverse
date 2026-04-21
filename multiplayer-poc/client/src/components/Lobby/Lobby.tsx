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

/** Lista de avatares disponibles en el carrusel, ordenados para su presentación. */
const AVATARS = [
  'guiyermion.png', 'fassbi.png', 'fenixped.png', 'ismaelo.png',
  'mono.png', 'selidios.png', 'sergigi.png', 'velas.png',
];

/**
 * Calcula el índice correcto dentro de un array circular, garantizando
 * que siempre se mantenga dentro de los límites del array.
 *
 * @param {number} index - El índice a normalizar.
 * @param {number} length - La longitud total del array.
 * @returns {number} El índice normalizado dentro del rango válido.
 */
const wrapIndex = (index: number, length: number): number =>
  ((index % length) + length) % length;

/**
 * Componente Lobby: Gestiona el registro de jugadores, la selección de avatares
 * mediante un carrusel interactivo, y la creación/unión a salas de juego.
 *
 * @param {LobbyProps} props - Propiedades del componente.
 * @returns {JSX.Element} El componente de la interfaz de usuario del lobby.
 */
export const Lobby: React.FC<LobbyProps> = ({ onCreate, onJoin, isLoading, error }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [centerIndex, setCenterIndex] = useState(0);
  const [mode, setMode] = useState<'initial' | 'create' | 'join'>('initial');

  /** El avatar actualmente seleccionado (el que está al centro del carrusel). */
  const selectedAvatar = AVATARS[centerIndex];

  /**
   * Avanza el carrusel al avatar siguiente de forma circular.
   */
  const handleNext = () => {
    playSFX('click');
    setCenterIndex(prev => wrapIndex(prev + 1, AVATARS.length));
  };

  /**
   * Retrocede el carrusel al avatar anterior de forma circular.
   */
  const handlePrev = () => {
    playSFX('click');
    setCenterIndex(prev => wrapIndex(prev - 1, AVATARS.length));
  };

  /**
   * Selecciona directamente un avatar al hacer clic sobre él en el carrusel.
   * @param {number} index - Índice del avatar en el array AVATARS.
   */
  const handleSelectAvatar = (index: number) => {
    if (index !== centerIndex) {
      playSFX('click');
      setCenterIndex(index);
    }
  };

  /**
   * Calcula la posición visual (izquierda, central o derecha) de un avatar
   * dentro del carrusel de 3 vistas, en función del índice central actual.
   *
   * @param {number} index - Índice del avatar a evaluar.
   * @returns {'left' | 'center' | 'right' | 'hidden'} La posición visual del avatar.
   */
  const getCarouselPosition = (index: number): 'left' | 'center' | 'right' | 'hidden' => {
    const leftIndex = wrapIndex(centerIndex - 1, AVATARS.length);
    const rightIndex = wrapIndex(centerIndex + 1, AVATARS.length);
    if (index === centerIndex) return 'center';
    if (index === leftIndex) return 'left';
    if (index === rightIndex) return 'right';
    return 'hidden';
  };

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

  // ── Vista inicial con opciones de Crear o Unirse ──────────────────────────
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
        <p className="lobby-subtitle">Elige cómo quieres empezar</p>
        <div className="initial-actions">
          <button onClick={() => setMode('create')}>Crear Partida</button>
          <button onClick={() => setMode('join')} className="secondary">Unirse por Código</button>
        </div>
      </div>
    );
  }

  // ── Vista de formulario (Crear o Unirse) ──────────────────────────────────
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

        {/* ── CARRUSEL DE AVATARES (GAP 1) ─────────────────────────────── */}
        <div className="avatar-section">
          <p className="section-label">Selecciona tu personaje:</p>

          <div className="avatar-carousel-wrapper">
            {/* Botón de navegación: anterior */}
            <button
              type="button"
              className="avatar-carousel__nav avatar-carousel__nav--prev"
              onClick={handlePrev}
              aria-label="Avatar anterior"
            >
              ‹
            </button>

            {/* Pista del carrusel */}
            <div className="avatar-carousel__track">
              {AVATARS.map((av, index) => {
                const pos = getCarouselPosition(index);
                return (
                  <div
                    key={av}
                    className={`avatar-carousel__item avatar-carousel__item--${pos}`}
                    onClick={() => handleSelectAvatar(index)}
                    role="button"
                    aria-label={av.replace('.png', '')}
                    aria-pressed={pos === 'center'}
                  >
                    <img src={`/avatars/${av}`} alt={av.replace('.png', '')} />
                    {pos === 'center' && (
                      <span className="avatar-carousel__selected-label">✓</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botón de navegación: siguiente */}
            <button
              type="button"
              className="avatar-carousel__nav avatar-carousel__nav--next"
              onClick={handleNext}
              aria-label="Avatar siguiente"
            >
              ›
            </button>
          </div>

          {/* Nombre del avatar seleccionado */}
          <p className="avatar-carousel__name">
            {selectedAvatar.replace('.png', '')}
          </p>

          {/* Indicadores de posición (dots) */}
          <div className="avatar-carousel__dots">
            {AVATARS.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`avatar-carousel__dot ${i === centerIndex ? 'active' : ''}`}
                onClick={() => handleSelectAvatar(i)}
                aria-label={`Seleccionar avatar ${i + 1}`}
              />
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

        <button type="submit" className="btn-submit" disabled={isLoading}>
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
