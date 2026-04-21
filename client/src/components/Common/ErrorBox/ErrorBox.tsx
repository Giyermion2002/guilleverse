import React from 'react';
import './ErrorBox.scss';

/**
 * Propiedades del componente ErrorBox.
 */
interface ErrorBoxProps {
  /** Mensaje de error a mostrar. Si es null o cadena vacía, el componente no renderiza nada. */
  message?: string | null;
}

/**
 * Componente ErrorBox: muestra un bloque de error estilizado con icono ⚠️.
 * No renderiza nada si `message` es falsy.
 *
 * @param {ErrorBoxProps} props - Propiedades del componente.
 * @returns {JSX.Element | null} El bloque de error, o null si no hay mensaje.
 */
export const ErrorBox: React.FC<ErrorBoxProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="error-box" role="alert" aria-live="polite">
      ⚠️ {message}
    </div>
  );
};
