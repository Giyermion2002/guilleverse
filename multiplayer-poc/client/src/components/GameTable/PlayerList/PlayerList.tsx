import React from 'react';
import './PlayerList.scss';

/**
 * Representa un jugador en la partida.
 */
interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost?: boolean;
}

/**
 * Propiedades del componente PlayerList.
 */
interface PlayerListProps {
  /** Lista de jugadores actualmente conectados. */
  players: Player[];
  /** Indica si la partida ha comenzado formalmente. */
  gameStarted: boolean;
}

/**
 * Componente que muestra la lista de jugadores conectados y sus estados.
 * 
 * @param {PlayerListProps} props - Propiedades del componente.
 * @returns {JSX.Element} El componente de la lista de jugadores.
 */
export const PlayerList: React.FC<PlayerListProps> = ({ players, gameStarted }) => {
  return (
    <div className="glass glass-card player-list-container">
      <h3>JUGADORES</h3>
      <ul className="player-ul">
        {players.map((p, index) => (
          <li key={p.id} className={`player-item ${index === 0 && gameStarted ? 'active-turn' : ''}`}>
            <div className="avatar-wrapper">
              <img src={`/avatars/${p.avatar}`} alt={p.name} />
            </div>
            <div className="player-info">
              <div className="player-header">
                <div className="player-name">{p.name}</div>
                {p.isHost && <span className="host-badge">HOST</span>}
              </div>
              <div className="player-status">
                {index === 0 && gameStarted ? '✨ ACTIVO' : 'CONECTADO'}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
