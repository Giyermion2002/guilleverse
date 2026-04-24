import React, { useEffect, useMemo, useState } from 'react';
import './ColorRoulette.scss';

/** Colores de minijuego disponibles. */
export type GameColor = 'amarillo' | 'rojo' | 'verde' | 'azul';

/**
 * Metadatos de cada color de minijuego: nombre visible, emoji, descripción y color CSS.
 */
const GAME_MODES: Record<GameColor, {
  label: string;
  emoji: string;
  description: string;
  cssColor: string;
  textColor: string;
}> = {
  amarillo: { label: 'EL SHOW DEL GUILLEVERSE', emoji: '📢', description: 'Mímica e interpretación', cssColor: '#ffd700', textColor: '#000' },
  rojo: { label: 'LOSH DOSH SOMOS LISTOS', emoji: '⚔️', description: 'Retos y rivalidades', cssColor: '#ff3333', textColor: '#fff' },
  verde: { label: 'CAOS MORAL', emoji: '🗳️', description: 'Consenso del grupo', cssColor: '#22cc44', textColor: '#000' },
  azul: { label: 'EL BAR DEL SERVER', emoji: '🔮', description: 'Conocimiento del rival', cssColor: '#3399ff', textColor: '#000' },
};

/**
 * Rotación final de la rueda para que el puntero (arriba) apunte al centro de cada sector.
 * La rueda tiene conic-gradient `from -45deg`, así cada sector está centrado en 0°/90°/180°/270°.
 * Fórmula: R = offset_sector + 5 * 360° (5 vueltas completas para el efecto visual).
 */
const SPIN_ROTATIONS: Record<GameColor, number> = {
  amarillo: 1800, // 0°  + 5*360
  rojo: 1890, // 90° + 5*360
  verde: 1980, // 180° + 5*360
  azul: 2070, // 270° + 5*360
};

/** Duración de la animación de giro en ms (debe coincidir con la transition de SCSS). */
const SPIN_DURATION_MS = 3500;
/** Tiempo que dura la fase de "reveal" (7 s de cuenta atrás + margen) antes de llamar onComplete. */
const REVEAL_DURATION_MS = 7500;

/**
 * Propiedades del componente ColorRoulette.
 */
interface ColorRouletteProps {
  /** Color ganador que determinó el servidor — la rueda siempre parará aquí. */
  color: GameColor;
  /** Callback que se invoca cuando toda la animación ha terminado. */
  onComplete: () => void;
}

/**
 * Fases de la animación de la ruleta.
 * - `idle`: componente montado, rueda en 0° (sin transición aún).
 * - `spinning`: transición en curso hacia la rotación final.
 * - `revealing`: rueda parada, reveal del modo ganador.
 * - `exiting`: fade-out antes de desmontar.
 */
type Phase = 'idle' | 'spinning' | 'revealing' | 'exiting';

// ────────────────────────────────────────────────────────────────────────────────
// Sub-componentes de efectos visuales (solo se montan en la fase 'revealing')
// ────────────────────────────────────────────────────────────────────────────────

const PARTICLE_COUNT = 32;
const RAY_COUNT      = 8;

/**
 * Explosión de partículas coloreadas que salen del centro de la rueda.
 * Cada partícula tiene ángulo, distancia, tamaño y timing aleatorios.
 */
const ParticleBurst: React.FC<{ color: string }> = ({ color }) => {
  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id:       i,
      angle:    (360 / PARTICLE_COUNT) * i + (Math.random() * 10 - 5),
      distance: 100 + Math.random() * 155,
      size:     3   + Math.random() * 8,
      delay:    Math.random() * 280,
      duration: 650 + Math.random() * 650,
      light:    Math.random() < 0.3,  // 30 % usan color claro para contraste
    })),
  []);

  return (
    <div className="cr-particle-burst">
      {particles.map(p => (
        <div
          key={p.id}
          className="cr-particle"
          style={{
            '--p-angle': `${p.angle}deg`,
            '--p-dist':  `${p.distance}px`,
            '--p-dur':   `${p.duration}ms`,
            '--p-delay': `${p.delay}ms`,
            width:       `${p.size}px`,
            height:      `${p.size}px`,
            background:  p.light ? '#fffacc' : color,
            boxShadow:   `0 0 ${p.size * 2}px 1px ${p.light ? '#fff8aa' : color}`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

/**
 * Rayos de energía que irradian desde el borde de la rueda y parpadean en bucle.
 */
const LightningRays: React.FC<{ color: string }> = ({ color }) => {
  const rays = useMemo(() =>
    Array.from({ length: RAY_COUNT }, (_, i) => ({
      id:       i,
      angle:    (360 / RAY_COUNT) * i + (Math.random() * 22 - 11),
      length:   55  + Math.random() * 85,
      delay:    Math.random() * 500,
      duration: 220 + Math.random() * 320,
    })),
  []);

  return (
    <div className="cr-lightning-container">
      {rays.map(r => (
        <div
          key={r.id}
          className="cr-lightning-ray"
          style={{
            '--r-angle': `${r.angle}deg`,
            '--r-length': `${r.length}px`,
            '--r-dur':   `${r.duration}ms`,
            '--r-delay': `${r.delay}ms`,
            background:  `linear-gradient(to right, ${color}, ${color}66, transparent)`,
            boxShadow:   `0 0 8px 2px ${color}80`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

/**
 * Componente ColorRoulette: overlay de pantalla completa que anima la "ruleta de colores"
 * del Guilleverse. La rueda gira ~5 vueltas y se detiene exactamente en el color `color`
 * indicado por el servidor, garantizando que todos los jugadores vean el mismo resultado.
 *
 * @param {ColorRouletteProps} props - Propiedades del componente.
 * @returns {JSX.Element} El overlay de la ruleta.
 */
export const ColorRoulette: React.FC<ColorRouletteProps> = ({ color, onComplete }) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [rotation, setRotation] = useState(0);
  const [countdown, setCountdown] = useState(7);
  const mode = GAME_MODES[color];

  // ── Secuencia de animación ────────────────────────────────────────────────
  useEffect(() => {
    // Pequeño delay para que el navegador pinte el estado `idle` antes de la transición
    const t1 = setTimeout(() => {
      setPhase('spinning');
      setRotation(SPIN_ROTATIONS[color]);
    }, 120);

    // Al terminar el giro → fase de reveal
    const t2 = setTimeout(() => {
      setPhase('revealing');
    }, 120 + SPIN_DURATION_MS);

    // Countdown regresivo de 7 a 1 (un tick por segundo a partir del reveal)
    const BASE = 120 + SPIN_DURATION_MS;
    const t3  = setTimeout(() => setCountdown(6), BASE + 1000);
    const t4  = setTimeout(() => setCountdown(5), BASE + 2000);
    const t5  = setTimeout(() => setCountdown(4), BASE + 3000);
    const t6  = setTimeout(() => setCountdown(3), BASE + 4000);
    const t7  = setTimeout(() => setCountdown(2), BASE + 5000);
    const t8  = setTimeout(() => setCountdown(1), BASE + 6000);

    // Fase de salida
    const t9 = setTimeout(() => {
      setPhase('exiting');
    }, 120 + SPIN_DURATION_MS + REVEAL_DURATION_MS);

    // Llamar onComplete cuando el fade-out ha terminado
    const t10 = setTimeout(() => {
      onComplete();
    }, 120 + SPIN_DURATION_MS + REVEAL_DURATION_MS + 600);

    return () => [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10].forEach(clearTimeout);
  }, [color, onComplete]);

  return (
    <div className={`color-roulette-overlay color-roulette-overlay--${phase}`}>
      <div className="color-roulette-modal">

        {/* Título */}
        <p className="color-roulette__title">
          {phase === 'revealing' || phase === 'exiting'
            ? '¡EL MINIJUEGO ES...'
            : '¿QUÉ MINIJUEGO OS TOCA?'}
        </p>

        {/* Área de la rueda */}
        <div className="color-roulette__wheel-area">
          {/* Puntero fijo en la parte superior */}
          <div className="color-roulette__pointer" />

          {/* Rueda giratoria */}
          <div
            className={`color-roulette__wheel color-roulette__wheel--${phase === 'revealing' || phase === 'exiting' ? 'revealed' : 'spinning'}`}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Etiquetas de cada sector (no rotan junto con la rueda: son decorativas) */}
            <span className="color-roulette__sector-label color-roulette__sector-label--amarillo">📢</span>
            <span className="color-roulette__sector-label color-roulette__sector-label--rojo">⚔️</span>
            <span className="color-roulette__sector-label color-roulette__sector-label--verde">🗳️</span>
            <span className="color-roulette__sector-label color-roulette__sector-label--azul">🔮</span>
          </div>

          {/* Glow ring que aparece al revelar */}
          {(phase === 'revealing' || phase === 'exiting') && (
            <div
              className="color-roulette__glow-ring"
              style={{ boxShadow: `0 0 60px 20px ${mode.cssColor}, 0 0 120px 40px ${mode.cssColor}40` }}
            />
          )}

          {/* ── Efectos de partículas, rayos y shockwave ── */}
          {(phase === 'revealing' || phase === 'exiting') && (
            <>
              {/* Anillo de onda expansiva */}
              <div
                className="cr-shockwave"
                style={{ borderColor: mode.cssColor, boxShadow: `0 0 15px ${mode.cssColor}` }}
              />
              <div
                className="cr-shockwave cr-shockwave--delayed"
                style={{ borderColor: mode.cssColor, boxShadow: `0 0 15px ${mode.cssColor}` }}
              />
              {/* Partículas y rayos */}
              <ParticleBurst color={mode.cssColor} />
              <LightningRays color={mode.cssColor} />
            </>
          )}

          {/* Hub central */}
          <div className="color-roulette__hub">
            {phase === 'revealing' || phase === 'exiting' ? mode.emoji : '?'}
          </div>
        </div>

        {/* Reveal del modo ganador */}
        <div className={`color-roulette__reveal ${phase === 'revealing' || phase === 'exiting' ? 'visible' : ''}`}>
          <p
            className="color-roulette__mode-name"
            style={{ color: mode.cssColor, textShadow: `0 0 20px ${mode.cssColor}` }}
          >
            {mode.label}
          </p>
          <p className="color-roulette__mode-desc">{mode.description}</p>
          <p className="color-roulette__countdown">
            Comenzando en <span style={{ color: mode.cssColor }}>{countdown}</span>...
          </p>
        </div>

        {/* Indicador de giro mientras gira */}
        {phase === 'idle' || phase === 'spinning' ? (
          <p className="color-roulette__spinning-hint">Girando...</p>
        ) : null}
      </div>
    </div>
  );
};
