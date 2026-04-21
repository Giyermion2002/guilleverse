import React from 'react';
import { createPortal } from 'react-dom';
import './Modal.scss';

/**
 * Propiedades del componente Modal.
 */
interface ModalProps {
  /** Indica si el modal está visible. */
  isOpen: boolean;
  /** Título principal del modal. */
  title: string;
  /** Mensaje o contenido descriptivo. */
  message: string;
  /** Texto del botón de confirmación. */
  confirmText?: string;
  /** Texto del botón de cancelación. */
  cancelText?: string;
  /** Función que se ejecuta al confirmar. */
  onConfirm: () => void;
  /** Función que se ejecuta al cancelar o cerrar. */
  onClose: () => void;
}

/**
 * Componente Modal genérico y reutilizable.
 * Utiliza React Portals para renderizarse en el root del documento, 
 * garantizando que el posicionamiento sea relativo al viewport y no a los padres.
 * 
 * @param {ModalProps} props - Propiedades del componente.
 * @returns {JSX.Element | null} El componente modal o null si está cerrado.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box glass" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>
        
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
