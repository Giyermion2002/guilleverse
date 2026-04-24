import React, { useState } from 'react';
import { playSFX } from '../../../utils/sfx';
import './ChatBox.scss';

/**
 * Representa un mensaje de chat.
 */
interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
  /** Mensaje del sistema (unión, salida, reconexión). Se muestra sin nombre y en gris. */
  isSystem?: boolean;
}

/**
 * Propiedades del componente ChatBox.
 */
interface ChatBoxProps {
  /** Lista de mensajes recibidos. */
  messages: ChatMessage[];
  /** Función para enviar un nuevo mensaje. */
  onSendMessage: (text: string) => void;
}

/**
 * Componente que muestra el historial de mensajes y el campo de entrada del chat.
 * 
 * @param {ChatBoxProps} props - Propiedades del componente.
 * @returns {JSX.Element} El componente del chat.
 */
export const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage }) => {
  const [chatInput, setChatInput] = useState('');

  /**
   * Maneja el envío del mensaje a través del formulario.
   * @param {React.FormEvent} e - Evento del formulario.
   */
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      playSFX('click');
      onSendMessage(chatInput);
      setChatInput('');
    }
  };

  return (
    <div className="glass chat-box-container">
      <h3>MENSAJES</h3>
      <div className="messages-list">
        {messages.length === 0 && <p className="empty-chat">No hay mensajes aún...</p>}
        {messages.map((m) => (
          m.isSystem
            ? (
              <div key={m.id} className="chat-msg chat-msg--system">
                <span className="system-text">{m.text}</span>
              </div>
            ) : (
              <div key={m.id} className="chat-msg">
                <span className="sender">{m.sender}: </span>
                <span className="text">{m.text}</span>
              </div>
            )
        ))}
      </div>
      <form onSubmit={handleChatSubmit} className="chat-form">
        <input
          type="text"
          placeholder="Mensaje..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          required
        />
        <button type="submit">ENVIAR</button>
      </form>
    </div>
  );
};
