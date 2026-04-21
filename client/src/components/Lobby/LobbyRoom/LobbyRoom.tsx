import React, { useState } from 'react';
import { playSFX } from '../../../utils/sfx';
import { Button } from '../../Common/Button/Button';
import './LobbyRoom.scss';

/**
 * Representa los datos mínimos de un jugador en la sala de espera.
 */
interface Player {
  /** Identificador único del socket del jugador. */
  id: string;
  /** Nombre o apodo elegido por el jugador. */
  name: string;
  /** Nombre del archivo del avatar seleccionado. */
  avatar: string;
  /** Indica si el jugador es el anfitrión de la partida. */
  isHost?: boolean;
}

/**
 * Propiedades del componente LobbyRoom.
 */
interface LobbyRoomProps {
  /** Código único de 4 caracteres de la sala, para compartir con otros. */
  roomCode: string;
  /** Indica si el usuario actual es el anfitrión de la sala. */
  isHost: boolean;
  /** Lista actualizada en tiempo real de los jugadores conectados. */
  players: Player[];
  /** Función que emite la señal de inicio de partida (solo disponible al Host). */
  onStartGame: () => void;
  /** Función que permite al jugador abandonar la sala y volver al Lobby inicial. */
  onLeaveRoom: () => void;
}

/** Número mínimo de jugadores requeridos para iniciar una partida. */
const QUORUM_MIN = 3;

/**
 * Componente LobbyRoom: pantalla de sala de espera que se muestra tras unirse a una sala,
 * antes de que el Host inicie la partida. Muestra el código de sala para compartir,
 * la lista de jugadores conectados en tiempo real y el indicador de quórum.
 *
 * @param {LobbyRoomProps} props - Propiedades del componente.
 * @returns {JSX.Element} La pantalla de sala de espera.
 */
export const LobbyRoom: React.FC<LobbyRoomProps> = ({
  roomCode,
  isHost,
  players,
  onStartGame,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = useState(false);

  /** Porcentaje de progreso hacia el quórum mínimo, con tope en 100%. */
  const quorumPercent = Math.min((players.length / QUORUM_MIN) * 100, 100);
  /** Indica si se ha alcanzado el quórum mínimo de jugadores. */
  const quorumReached = players.length >= QUORUM_MIN;

  /**
   * Copia el código de sala al portapapeles y muestra un feedback visual temporal.
   */
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      playSFX('click');
      setCopied(true);
      // Resetear el feedback de "Copiado" tras 2 segundos
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /**
   * Dispara la señal de inicio y reproduce el efecto de sonido correspondiente.
   */
  const handleStartGame = () => {
    if (quorumReached) {
      playSFX('join');
      onStartGame();
    }
  };

  return (
    <div className="lobby-room glass glass-card">
      {/* Cabecera con botón de salida */}
      <div className="lobby-room__header">
        <Button
          variant="ghost"
          onClick={() => {
            playSFX('click');
            onLeaveRoom();
          }}
        >
          ← Salir
        </Button>
        <h1 className="lobby-room__title">Sala de Espera</h1>
      </div>

      {/* Bloque del código de sala */}
      <div className="lobby-room__code-block">
        <p className="lobby-room__code-label">Comparte este código:</p>
        <div className="lobby-room__code-display">
          <span className="lobby-room__code-value">{roomCode}</span>
          <Button
            variant="secondary"
            className={`lobby-room__btn-copy${copied ? ' copied' : ''}`}
            onClick={handleCopyCode}
            title="Copiar código"
          >
            {copied ? '✓ Copiado' : '⧉ Copiar'}
          </Button>
        </div>
      </div>

      {/* Indicador visual de quórum — GAP 3 */}
      <div className="lobby-room__quorum">
        <p className="lobby-room__quorum-label">
          <span className={`lobby-room__quorum-count ${quorumReached ? 'reached' : ''}`}>
            {players.length}
          </span>
          {' '}/{' '}{QUORUM_MIN} jugadores para empezar
        </p>
        <div className="lobby-room__quorum-bar-track">
          <div
            className={`lobby-room__quorum-bar-fill ${quorumReached ? 'reached' : ''}`}
            style={{ width: `${quorumPercent}%` }}
          />
        </div>
      </div>

      {/* Lista de jugadores conectados en tiempo real */}
      <div className="lobby-room__players">
        <p className="lobby-room__players-title">Jugadores conectados:</p>
        <ul className="lobby-room__players-list">
          {players.map((player) => (
            <li key={player.id} className="lobby-room__player-item">
              <div className="lobby-room__player-avatar-wrapper">
                <img
                  src={`/avatars/${player.avatar}`}
                  alt={player.name}
                  className="lobby-room__player-avatar"
                />
                {player.isHost && (
                  <span className="lobby-room__host-badge" title="Anfitrión">👑</span>
                )}
              </div>
              <span className="lobby-room__player-name">
                {player.name}
                <span className="lobby-room__player-character">
                  ({player.avatar.replace('.png', '')})
                </span>
              </span>
              {player.isHost && (
                <span className="lobby-room__host-label">Host</span>
              )}
            </li>
          ))}

          {/* Slots vacíos animados hasta alcanzar el quórum */}
          {Array.from({ length: Math.max(0, QUORUM_MIN - players.length) }).map((_, i) => (
            <li key={`empty-${i}`} className="lobby-room__player-item empty">
              <div className="lobby-room__player-avatar-wrapper">
                <div className="lobby-room__empty-avatar">?</div>
              </div>
              <span className="lobby-room__player-name">Esperando...</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Área de acción inferior: diferente para Host y Jugador */}
      <div className="lobby-room__footer">
        {isHost ? (
          <Button
            className={`lobby-room__btn-start${quorumReached ? ' active' : ' disabled'}`}
            onClick={handleStartGame}
            disabled={!quorumReached}
          >
            {quorumReached ? '⚡ EMPEZAR PARTIDA' : `Faltan ${QUORUM_MIN - players.length} jugador(es)`}
          </Button>
        ) : (
          <p className="lobby-room__waiting-msg">
            Esperando que el Host inicie la partida...
            <span className="lobby-room__waiting-dots" />
          </p>
        )}
      </div>
    </div>
  );
};
