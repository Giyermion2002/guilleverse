import React, { useState, useEffect } from 'react';
import { engine, playSFX } from '../../utils/sfx';
import './AudioControl.scss';

/**
 * Componente AudioControl.
 * Proporciona una interfaz para mutear el audio global e iniciar el sonido ambiental.
 * 
 * @returns {JSX.Element} El componente de control de audio.
 */
export const AudioControl: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [ambientActive, setAmbientActive] = useState(false);

  /**
   * Cambia el estado de silencio global y gestiona el sonido ambiental.
   */
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    engine.setMuted(newMuted);
    playSFX('click');
  };

  /**
   * Asegura que el motor de audio se inicialice al primer clic en cualquier parte del documento.
   */
  useEffect(() => {
    const handleFirstClick = () => {
      engine.init();
      // No activamos el ambiente automáticamente aquí para respetar el silencio inicial
      document.removeEventListener('click', handleFirstClick);
    };
    document.addEventListener('click', handleFirstClick);
    return () => document.removeEventListener('click', handleFirstClick);
  }, []);

  return (
    <div className="audio-control-wrapper">
      <button 
        className={`audio-btn ${isMuted ? 'muted' : ''}`} 
        onClick={toggleMute}
        title={isMuted ? "Activar sonido" : "Silenciar"}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
};
