import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playSFX } from '../../../utils/sfx';
import { SectionLabel } from '../../Common/SectionLabel/SectionLabel';
import './AvatarCarousel.scss';

/** Lista de avatares disponibles en el carrusel. */
export const AVATARS = [
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

/** Mínimo desplazamiento en px para considerar el gesto como drag real. */
const DRAG_MOVE_THRESHOLD = 8;

/** Duración de la animación de cierre del tooltip en ms (debe coincidir con SCSS). */
const TOOLTIP_EXIT_MS = 200;

/**
 * Normaliza un índice dentro de los límites de un array circular.
 *
 * @param {number} index - El índice a normalizar.
 * @param {number} length - La longitud del array.
 * @returns {number} Índice normalizado en rango [0, length).
 */
const wrapIndex = (index: number, length: number): number =>
  ((index % length) + length) % length;

/**
 * Propiedades del componente AvatarCarousel.
 */
interface AvatarCarouselProps {
  /**
   * Callback que recibe el nombre de archivo del avatar seleccionado
   * cada vez que el usuario cambia su selección.
   */
  onSelect: (avatar: string) => void;
}

/**
 * Componente AvatarCarousel: carrusel interactivo de selección de personaje.
 * Gestiona su propio estado (índice central, tooltip, drag con inercia) y notifica
 * al componente padre a través de `onSelect` cuando el avatar activo cambia.
 *
 * @param {AvatarCarouselProps} props - Propiedades del componente.
 * @returns {JSX.Element} El carrusel de avatares.
 */
export const AvatarCarousel: React.FC<AvatarCarouselProps> = ({ onSelect }) => {
  const [centerIndex, setCenterIndex]         = useState(0);
  const [isSpinning, setIsSpinning]           = useState(false);
  const [showAbilities, setShowAbilities]     = useState(false);
  const [isClosingTooltip, setIsClosingTooltip] = useState(false);

  // ── Referencias para el drag y el tooltip ────────────────────────────────
  const trackRef        = useRef<HTMLDivElement>(null);
  const dragStartX      = useRef<number>(-1);
  const dragLastX       = useRef<number>(-1);
  const dragLastTime    = useRef<number>(0);
  const dragVelocity    = useRef<number>(0);
  const didDrag         = useRef<boolean>(false);
  const spinTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinningRef     = useRef<boolean>(false);
  const closeTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Notifica al padre cuando el avatar activo cambia. */
  useEffect(() => {
    onSelect(AVATARS[centerIndex]);
  }, [centerIndex, onSelect]);

  // ── Motor de inercia tipo ruleta ──────────────────────────────────────────

  /**
   * Detiene cualquier inercia en curso y cancela el timeout pendiente.
   */
  const stopSpin = useCallback(() => {
    if (spinTimerRef.current) clearTimeout(spinTimerRef.current);
    spinTimerRef.current = null;
    spinningRef.current  = false;
    setIsSpinning(false);
  }, []);

  /**
   * Lanza la animación de inercia de la ruleta al soltar el arrastre.
   * La dirección viene del gesto, pero velocidad, pasos y deceleración son aleatorios.
   *
   * @param {number} velocityPxMs - Velocidad final del drag en px/ms (solo determina dirección).
   */
  const startInertialSpin = useCallback((velocityPxMs: number) => {
    stopSpin();
    if (Math.abs(velocityPxMs) < 0.03) return;

    const direction   = velocityPxMs < 0 ? 1 : -1;
    const baseInterval = 35 + Math.random() * 55;     // 35–90 ms
    const maxSteps     = 6 + Math.floor(Math.random() * 23); // 6–28 pasos
    const deceleration = 1.20 + Math.random() * 0.30; // ×1.20–×1.50

    let step     = 0;
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

  /** Inicia el seguimiento del drag. Cancela cualquier inercia previa. */
  const handleTrackMouseDown = (e: React.MouseEvent) => {
    stopSpin();
    dragStartX.current   = e.clientX;
    dragLastX.current    = e.clientX;
    dragLastTime.current = performance.now();
    dragVelocity.current = 0;
    didDrag.current      = false;
  };

  /**
   * Actualiza la velocidad del drag con un filtro EMA (70/30) para suavizar picos.
   */
  const handleTrackMouseMove = (e: React.MouseEvent) => {
    if (dragStartX.current === -1) return;
    if (!(e.buttons & 1)) { dragStartX.current = -1; return; }

    const now = performance.now();
    const dt  = now - dragLastTime.current;
    const dx  = e.clientX - dragLastX.current;

    if (dt > 0) {
      dragVelocity.current = dragVelocity.current * 0.7 + (dx / dt) * 0.3;
    }

    dragLastX.current    = e.clientX;
    dragLastTime.current = now;

    if (Math.abs(e.clientX - dragStartX.current) > DRAG_MOVE_THRESHOLD) {
      didDrag.current = true;
    }
  };

  /** Al soltar el ratón, lanza la inercia si hubo drag real. */
  const handleTrackMouseUp = () => {
    if (dragStartX.current === -1) return;
    dragStartX.current = -1;
    if (didDrag.current) startInertialSpin(dragVelocity.current);
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

  /**
   * Cierra el tooltip con animación de salida antes de desmontarlo.
   */
  const closeTooltip = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsClosingTooltip(true);
    closeTimerRef.current = setTimeout(() => {
      setShowAbilities(false);
      setIsClosingTooltip(false);
    }, TOOLTIP_EXIT_MS);
  }, []);

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
   * Selecciona un avatar al hacer clic, ignorando clics que siguieron a un drag.
   * @param {number} index - Índice del avatar en AVATARS.
   */
  const handleSelectAvatar = (index: number) => {
    if (didDrag.current) return;
    if (index !== centerIndex) {
      playSFX('click');
      setCenterIndex(index);
    }
  };

  /**
   * Devuelve la posición visual de un avatar en el carrusel (3 posiciones visibles).
   * @param {number} index - Índice a evaluar.
   * @returns {'left' | 'center' | 'right' | 'hidden'} La posición visual.
   */
  const getCarouselPosition = (index: number): 'left' | 'center' | 'right' | 'hidden' => {
    const leftIndex  = wrapIndex(centerIndex - 1, AVATARS.length);
    const rightIndex = wrapIndex(centerIndex + 1, AVATARS.length);
    if (index === centerIndex) return 'center';
    if (index === leftIndex)   return 'left';
    if (index === rightIndex)  return 'right';
    return 'hidden';
  };

  const selectedAvatar = AVATARS[centerIndex];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="avatar-section">
      <SectionLabel>Selecciona tu personaje:</SectionLabel>

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
            onClick={() => showAbilities ? closeTooltip() : setShowAbilities(true)}
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

          {/* Avatares */}
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
            className={`avatar-carousel__dot${i === centerIndex ? ' active' : ''}`}
            onClick={() => handleSelectAvatar(i)}
            aria-label={`Seleccionar avatar ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
