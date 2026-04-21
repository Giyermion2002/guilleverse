import React, { useState, useEffect, useRef, useCallback } from 'react';
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

/** Lista de avatares disponibles en el carrusel. */
const AVATARS = [
  'guiyermion.png', 'fassbi.png', 'fenixped.png', 'ismaelo.png',
  'mono.png', 'selidios.png', 'sergigi.png', 'velas.png',
];

/**
 * Mapa de habilidades reales de cada personaje del Guilleverse.
 * La clave es el nombre del archivo del avatar.
 */
const AVATAR_ABILITIES: Record<string, string> = {
  'guiyermion.png': '😂 Risa contagiosa — En cartas verdes su voto vale el doble.',
  'fassbi.png':     '🕷️ La araña — En cartas rojas, si la pregunta es de Marvel o el Barça y acierta, gana un punto de más.',
  'fenixped.png':   '💥 Rompe Ralph — En cartas amarillas puede añadir un gesto exagerado extra. Si su equipo acierta, gana un punto de más.',
  'ismaelo.png':    '👻 El desaparecido — Puede saltarse su turno sin penalización una vez por partida.',
  'mono.png':       '🐒 Competencia natural — Si elige a VELAS como rival en carta roja, obtiene un punto de más.',
  'selidios.png':   '🔵 Conexión abismal — En cartas azules, si adivina exactamente la respuesta, obtiene un punto de más.',
  'sergigi.png':    '😤 Yo tengo la razón — Si pierde en una carta roja, puede convertir la derrota en empate: nadie gana ni pierde puntos.',
  'velas.png':      '🕯️ Pique legendario — Si elige a MONO como rival en carta roja, obtiene un punto de más.',
};

/** Píxeles de desplazamiento total antes de marcar el gesto como drag real. */
const DRAG_MOVE_THRESHOLD = 8;

/** Duración de la animación de cierre del tooltip, en ms. Debe coincidir con el SCSS. */
const TOOLTIP_EXIT_MS = 200;

/**
 * Calcula el índice correcto dentro de un array circular.
 *
 * @param {number} index - El índice a normalizar.
 * @param {number} length - La longitud total del array.
 * @returns {number} El índice normalizado dentro del rango válido.
 */
const wrapIndex = (index: number, length: number): number =>
  ((index % length) + length) % length;

/**
 * Componente Lobby: registro de jugadores, carrusel de avatares con inercia tipo ruleta,
 * tooltip de habilidades con animación de entrada/salida, y creación/unión a salas.
 *
 * @param {LobbyProps} props - Propiedades del componente.
 * @returns {JSX.Element} La interfaz del lobby.
 */
export const Lobby: React.FC<LobbyProps> = ({ onCreate, onJoin, isLoading, error }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [centerIndex, setCenterIndex] = useState(0);
  const [mode, setMode] = useState<'initial' | 'create' | 'join'>('initial');
  /** Flag visual: true mientras el carrusel está en inercia. */
  const [isSpinning, setIsSpinning] = useState(false);

  // ── Estado del tooltip de habilidades ──────────────────────────────────────
  const [showAbilities, setShowAbilities] = useState(false);
  const [isClosingTooltip, setIsClosingTooltip] = useState(false);

  // ── Referencias estables para el carrusel y el drag ───────────────────────
  const trackRef        = useRef<HTMLDivElement>(null);
  const dragStartX      = useRef<number>(-1);
  const dragLastX       = useRef<number>(-1);
  const dragLastTime    = useRef<number>(0);
  /** Velocidad actual del drag en px/ms (EMA suavizada). */
  const dragVelocity    = useRef<number>(0);
  /** True si el gesto superó el umbral y se considera drag real. */
  const didDrag         = useRef<boolean>(false);
  /** Handle del timeout de inercia para poder cancelarlo. */
  const spinTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Usado para cancelar la inercia cuando el usuario arrastra de nuevo. */
  const spinningRef     = useRef<boolean>(false);
  const closeTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Motor de inercia tipo ruleta ──────────────────────────────────────────

  /**
   * Detiene cualquier inercia en curso y limpia el timeout.
   */
  const stopSpin = useCallback(() => {
    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    spinTimerRef.current = null;
    spinningRef.current = false;
    setIsSpinning(false);
  }, []);

  /**
   * Lanza la animación de inercia de la ruleta al soltar el arrastre.
   * La dirección viene del drag, pero los parámetros de giro son completamente aleatorios,
   * como una ruleta real: nunca sabes exactamente dónde va a parar.
   *
   * @param {number} velocityPxMs - Solo se usa para determinar la dirección del giro.
   */
  const startInertialSpin = useCallback((velocityPxMs: number) => {
    stopSpin();

    // Si prácticamente no hubo movimiento, no girar
    if (Math.abs(velocityPxMs) < 0.03) return;

    // Dirección del drag → dirección del giro (arrastrar izquierda = avanzar)
    const direction = velocityPxMs < 0 ? 1 : -1;

    // ── Parámetros aleatorios de la ruleta ────────────────────────────────
    // Intervalo inicial: entre 35ms (muy rápido) y 90ms (moderado)
    const baseInterval = 35 + Math.random() * 55;
    // Pasos totales: entre 6 (corto) y 28 (largo)
    const maxSteps = 6 + Math.floor(Math.random() * 23);
    // Deceleración: entre 1.20 (para suave) y 1.50 (para brusco)
    const deceleration = 1.20 + Math.random() * 0.30;

    let step = 0;
    let interval = baseInterval;
    spinningRef.current = true;
    setIsSpinning(true);

    const runStep = () => {
      if (!spinningRef.current || step >= maxSteps || interval > 500) {
        setIsSpinning(false);
        spinningRef.current = false;
        return;
      }
      playSFX('click');
      setCenterIndex(prev => wrapIndex(prev + direction, AVATARS.length));
      step++;
      interval *= deceleration;
      spinTimerRef.current = setTimeout(runStep, interval);
    };

    spinTimerRef.current = setTimeout(runStep, interval);
  }, [stopSpin]);


  // ── Handlers del drag ────────────────────────────────────────────────────

  /**
   * Inicia el seguimiento del arrastre y cancela cualquier inercia previa.
   * @param {React.MouseEvent} e - Evento mousedown.
   */
  const handleTrackMouseDown = (e: React.MouseEvent) => {
    stopSpin(); // si estaba girando, parar inmediatamente
    dragStartX.current   = e.clientX;
    dragLastX.current    = e.clientX;
    dragLastTime.current = performance.now();
    dragVelocity.current = 0;
    didDrag.current      = false;
  };

  /**
   * Actualiza la velocidad del drag con un filtro EMA (media móvil exponencial)
   * para suavizar los picos y obtener una velocidad representativa al soltar.
   * @param {React.MouseEvent} e - Evento mousemove.
   */
  const handleTrackMouseMove = (e: React.MouseEvent) => {
    if (dragStartX.current === -1) return;
    if (!(e.buttons & 1)) { dragStartX.current = -1; return; }

    const now = performance.now();
    const dt  = now - dragLastTime.current;
    const dx  = e.clientX - dragLastX.current;

    if (dt > 0) {
      // EMA: 70% valor anterior + 30% nueva muestra
      dragVelocity.current = dragVelocity.current * 0.7 + (dx / dt) * 0.3;
    }

    dragLastX.current    = e.clientX;
    dragLastTime.current = now;

    if (Math.abs(e.clientX - dragStartX.current) > DRAG_MOVE_THRESHOLD) {
      didDrag.current = true;
    }
  };

  /**
   * Al soltar el ratón, lanza la inercia si hubo drag real.
   */
  const handleTrackMouseUp = () => {
    if (dragStartX.current === -1) return;
    dragStartX.current = -1;
    if (didDrag.current) {
      startInertialSpin(dragVelocity.current);
    }
  };

  // ── Listener de clic fuera del tooltip ────────────────────────────────────
  useEffect(() => {
    if (!showAbilities) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (trackRef.current && !trackRef.current.contains(e.target as Node)) {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        setIsClosingTooltip(true);
        closeTimerRef.current = setTimeout(() => {
          setShowAbilities(false);
          setIsClosingTooltip(false);
        }, TOOLTIP_EXIT_MS);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showAbilities]);

  // ── Helpers del carrusel ──────────────────────────────────────────────────

  const selectedAvatar = AVATARS[centerIndex];

  /** Avanza al avatar siguiente. */
  const handleNext = () => {
    playSFX('click');
    setCenterIndex(prev => wrapIndex(prev + 1, AVATARS.length));
  };

  /** Retrocede al avatar anterior. */
  const handlePrev = () => {
    playSFX('click');
    setCenterIndex(prev => wrapIndex(prev - 1, AVATARS.length));
  };

  /**
   * Selecciona un avatar directamente al hacer clic, si no hubo arrastre previo.
   * @param {number} index - Índice del avatar en AVATARS.
   */
  const handleSelectAvatar = (index: number) => {
    if (didDrag.current) return; // ignorar click si fue drag
    if (index !== centerIndex) {
      playSFX('click');
      setCenterIndex(index);
    }
  };

  /**
   * Devuelve la posición visual de un avatar en el carrusel.
   * @param {number} index - Índice a evaluar.
   * @returns {'left' | 'center' | 'right' | 'hidden'} Posición visual.
   */
  const getCarouselPosition = (index: number): 'left' | 'center' | 'right' | 'hidden' => {
    const leftIndex = wrapIndex(centerIndex - 1, AVATARS.length);
    const rightIndex = wrapIndex(centerIndex + 1, AVATARS.length);
    if (index === centerIndex) return 'center';
    if (index === leftIndex) return 'left';
    if (index === rightIndex) return 'right';
    return 'hidden';
  };

  // ── Handlers del formulario ───────────────────────────────────────────────

  /**
   * Maneja el envío del formulario de creación de sala.
   * @param {React.FormEvent} e - Evento del formulario.
   */
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onCreate(name.trim(), selectedAvatar);
  };

  /**
   * Maneja el envío del formulario para unirse a una sala.
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
          <button onClick={() => setMode('create')}>Crear Partida</button>
          <button onClick={() => setMode('join')} className="secondary">Unirse por Código</button>
        </div>
      </div>
    );
  }

  // ── Vista de formulario (Crear o Unirse) ──────────────────────────────────
  return (
    <div className="glass glass-card lobby-container lobby-container--form">
      <button
        onClick={() => { playSFX('click'); setMode('initial'); }}
        className="btn-back"
      >
        ← Volver
      </button>

      <h1>{mode === 'create' ? 'Crear Partida' : 'Unirse a Partida'}</h1>

      {error && <div className="error-box">⚠️ {error}</div>}

      <form onSubmit={mode === 'create' ? handleCreate : handleJoin} className="lobby-form">
        <input
          type="text"
          placeholder="Tu apodo..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />

        {/* ── CARRUSEL DE AVATARES ──────────────────────────────────────── */}
        <div className="avatar-section">
          <p className="section-label">Selecciona tu personaje:</p>

          <div className="avatar-carousel-wrapper">
            {/* Flecha anterior */}
            <button
              type="button"
              className="avatar-carousel__nav avatar-carousel__nav--prev"
              onClick={handlePrev}
              aria-label="Avatar anterior"
            >
              ‹
            </button>

            {/* Pista del carrusel con soporte de drag + inercia */}
            <div
              className={`avatar-carousel__track${isSpinning ? ' spinning' : ''}`}
              ref={trackRef}
              onMouseDown={handleTrackMouseDown}
              onMouseMove={handleTrackMouseMove}
              onMouseUp={handleTrackMouseUp}
              onMouseLeave={handleTrackMouseUp}
            >
              {/* Botón ? de habilidades */}
              <button
                type="button"
                className="avatar-carousel__abilities-btn"
                onClick={() => {
                  if (showAbilities) {
                    closeTooltip();
                  } else {
                    setShowAbilities(true);
                  }
                }}
                aria-label="Ver habilidades del personaje"
              >
                ?
              </button>

              {/* Tooltip de habilidades con animación de entrada/salida */}
              {showAbilities && (
                <div className={`avatar-carousel__abilities-tooltip${isClosingTooltip ? ' closing' : ''}`}>
                  <strong>{selectedAvatar.replace('.png', '')}</strong>
                  <p>{AVATAR_ABILITIES[selectedAvatar]}</p>
                </div>
              )}

              {/* Avatares del carrusel */}
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
                    <img src={`/avatars/${av}`} alt={av.replace('.png', '')} draggable={false} />
                    {pos === 'center' && (
                      <span className="avatar-carousel__selected-label">✓</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Flecha siguiente */}
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
          <p className="avatar-carousel__name">{selectedAvatar.replace('.png', '')}</p>

          {/* Dots indicadores */}
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
          {isLoading ? <span>Conectando...</span> : (mode === 'create' ? 'Comenzar como Host' : 'Unirse ahora')}
        </button>
      </form>
    </div>
  );
};
