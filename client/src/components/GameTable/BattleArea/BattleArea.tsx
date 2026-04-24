import React, { useState } from 'react';
import { playSFX } from '../../../utils/sfx';
import { Modal } from '../../Common/Modal/Modal';
import { type GameColor } from '../../ColorRoulette/ColorRoulette';
import './BattleArea.scss';

/**
 * Representa una acción registrada en el historial del juego.
 */
interface Action {
  playerName: string;
  action: string;
  timestamp: string;
}

/**
 * Propiedades del componente BattleArea.
 */
interface BattleAreaProps {
  roomCode: string;
  isHost: boolean;
  gameStarted: boolean;
  /** Color de minijuego activo (elegido por la ruleta). */
  gameColor: GameColor | null;
  playerCount: number;
  lastAction: Action | null;
  onStartGame: () => void;
  onPlayCard: (card: { type: string, value: string }) => void;
  onLeaveRoom: () => void;
}

/**
 * Componente que representa el área central de juego, los controles del host 
 * y la mano de cartas del jugador.
 * 
 * @param {BattleAreaProps} props - Propiedades del componente.
 * @returns {JSX.Element} El componente del área de batalla.
 */
/** Metadatos visuales de cada color de minijuego. */
const MODE_META: Record<GameColor, { label: string; emoji: string; cssColor: string }> = {
  amarillo: { label: 'EXPRESIÓN',   emoji: '📢', cssColor: '#ffd700' },
  rojo:     { label: 'DUELO',       emoji: '⚔️', cssColor: '#ff3333' },
  verde:    { label: 'VOTACIÓN',    emoji: '🗳️', cssColor: '#22cc44' },
  azul:     { label: 'ADIVINANZA', emoji: '🔮', cssColor: '#3399ff' },
};

export const BattleArea: React.FC<BattleAreaProps> = ({
  roomCode, isHost, gameStarted, gameColor, playerCount, lastAction, onStartGame, onPlayCard, onLeaveRoom
}) => {
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  /**
   * Copia el código de la sala al portapapeles.
   */
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Código copiado: ' + roomCode);
  };

  /**
   * Abre el modal de confirmación para salir.
   */
  const handleRequestLeave = () => {
    playSFX('click');
    setShowLeaveModal(true);
  };

  /**
   * Confirma la salida y cierra el modal.
   */
  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    onLeaveRoom();
  };

  return (
    <div className="glass glass-card battle-area-container">
      {/* Modal de Confirmación */}
      <Modal
        isOpen={showLeaveModal}
        title="¿Abandonar partida?"
        message="¿Estás seguro de que quieres volver al Lobby? Se perderá tu progreso actual."
        confirmText="SÍ, SALIR"
        cancelText="CANCELAR"
        onConfirm={handleConfirmLeave}
        onClose={() => setShowLeaveModal(false)}
      />

      <div className="table-header">
        <button className="btn-leave" onClick={handleRequestLeave} title="Volver al Lobby">
          <span>SALIR</span>
        </button>
        
        <h2>Mesa de Juego</h2>
        
        <div className="glass room-info">
          <span>SALA: <strong className="code">{roomCode}</strong></span>
          <button onClick={copyCode}>Copiar</button>
        </div>
      </div>

      <div className="table-content">
        {/* Controles de inicio para el Host */}
        {isHost && !gameStarted && (
          <div className="waiting-msg">
            {playerCount < 3 && (
              <p>Esperando a más jugadores (Mínimo 3)...</p>
            )}
            <button
              className="btn-start"
              onClick={onStartGame}
              disabled={playerCount < 3}
            >
              EMPEZAR PARTIDA
            </button>
          </div>
        )}

        {/* Badge de modo activo */}
        {gameStarted && gameColor && (() => {
          const meta = MODE_META[gameColor];
          return (
            <div
              className="game-mode-badge"
              style={{
                borderColor: meta.cssColor,
                color: meta.cssColor,
                boxShadow: `0 0 12px ${meta.cssColor}60`,
              }}
            >
              <span className="game-mode-badge__emoji">{meta.emoji}</span>
              <span className="game-mode-badge__label">{meta.label}</span>
            </div>
          );
        })()}

        {/* Área de acciones central */}
        <div className="table-center">
          {lastAction ? (
            <div className="action-popup glass">
              <strong>{lastAction.playerName}</strong>
              <span>{lastAction.action}</span>
            </div>
          ) : (
            <p className="empty-msg">Esperando movimientos...</p>
          )}
        </div>
      </div>

      <div className="player-hand">
        {['Espada', 'Copa', 'Oro', 'Basto'].map(type => (
          <button
            key={type}
            className={`glass-card card-btn card-${type.toLowerCase()}`}
            onClick={() => {
              playSFX('click');
              onPlayCard({ type, value: 'As' });
            }}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};
