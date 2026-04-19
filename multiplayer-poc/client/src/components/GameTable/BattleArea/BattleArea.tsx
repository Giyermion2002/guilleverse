import React from 'react';
import { playSFX } from '../../../utils/sfx';
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
  playerCount: number;
  lastAction: Action | null;
  onStartGame: () => void;
  onPlayCard: (card: { type: string, value: string }) => void;
}

/**
 * Componente que representa el área central de juego, los controles del host 
 * y la mano de cartas del jugador.
 * 
 * @param {BattleAreaProps} props - Propiedades del componente.
 * @returns {JSX.Element} El componente del área de batalla.
 */
export const BattleArea: React.FC<BattleAreaProps> = ({
  roomCode, isHost, gameStarted, playerCount, lastAction, onStartGame, onPlayCard
}) => {
  /**
   * Copia el código de la sala al portapapeles.
   */
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Código copiado: ' + roomCode);
  };

  return (
    <div className="glass glass-card battle-area-container">
      <div className="table-header">
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

        {/* Estado de la partida */}
        {gameStarted && (
          <div className="game-status">
            <span className="status-badge">PARTIDA EN CURSO</span>
          </div>
        )}

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

      {/* Mano del jugador (Botones de acción rápidos) */}
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
