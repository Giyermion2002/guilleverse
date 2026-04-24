import React, { useState, useEffect } from 'react';
import { PlayerList } from './PlayerList/PlayerList';
import { BattleArea } from './BattleArea/BattleArea';
import { ChatBox } from './ChatBox/ChatBox';
import { type GameColor } from '../ColorRoulette/ColorRoulette';
import './GameTable.scss';

/** 
 * Tipos básicos para el componente.
 */
interface Player { id: string; name: string; avatar: string; isHost?: boolean; }
interface ChatMessage { id: string; sender: string; avatar: string; text: string; timestamp: string; }
interface Action { playerName: string; action: string; timestamp: string; }

/**
 * Propiedades del orquestador GameTable.
 */
interface GameTableProps {
  roomCode: string;
  isHost: boolean;
  gameStarted: boolean;
  /** Color de minijuego activo, determinado por la ruleta al inicio de la partida. */
  gameColor: GameColor | null;
  players: Player[];
  actions: Action[];
  messages: ChatMessage[];
  onStartGame: () => void;
  onPlayCard: (card: { type: string, value: string }) => void;
  onSendMessage: (text: string) => void;
  onLeaveRoom: () => void;
}

/**
 * Componente Orquestador para la mesa de juego.
 * Implementa el layout de 3 columnas distribuyendo los datos y eventos a sub-componentes especializados.
 * 
 * @param {GameTableProps} props - Propiedades del componente.
 * @returns {JSX.Element} El componente orquestador de la mesa de juego.
 */
export const GameTable: React.FC<GameTableProps> = ({
  roomCode, isHost, gameStarted, gameColor, players, actions, messages, onStartGame, onPlayCard, onSendMessage, onLeaveRoom
}) => {
  const [lastAction, setLastAction] = useState<Action | null>(null);

  // Sincronizar la última acción recibida para el centro de la mesa
  useEffect(() => {
    if (actions.length > 0) {
      setLastAction(actions[0]);
    }
  }, [actions]);

  return (
    <div className="game-layout">
      {/* COLUMNA 1: LISTA DE JUGADORES */}
      <div className="sidebar left-sidebar">
        <PlayerList players={players} gameStarted={gameStarted} />
      </div>

      {/* COLUMNA 2: ÁREA DE BATALLA CENTRAL */}
      <div className="main-table-wrapper">
        <BattleArea 
          roomCode={roomCode}
          isHost={isHost}
          gameStarted={gameStarted}
          gameColor={gameColor}
          playerCount={players.length}
          lastAction={lastAction}
          onStartGame={onStartGame}
          onPlayCard={onPlayCard}
          onLeaveRoom={onLeaveRoom}
        />
      </div>

      {/* COLUMNA 3: CHAT Y MENSAJES */}
      <div className="sidebar right-sidebar">
        <ChatBox messages={messages} onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};
