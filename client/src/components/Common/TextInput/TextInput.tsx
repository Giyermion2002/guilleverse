import React from 'react';
import './TextInput.scss';

/**
 * Propiedades del componente TextInput.
 */
interface TextInputProps {
  /** Valor controlado del input. */
  value: string;
  /** Callback que recibe el nuevo valor como string (sin el evento). */
  onChange: (value: string) => void;
  /** Texto de placeholder. */
  placeholder?: string;
  /** Tipo HTML del input. Por defecto: 'text'. */
  type?: React.InputHTMLAttributes<HTMLInputElement>['type'];
  /** Marca el campo como requerido en el formulario. */
  required?: boolean;
  /** Foco automático al montar el componente. */
  autoFocus?: boolean;
  /** Número máximo de caracteres. */
  maxLength?: number;
  /** ID para asociar con un `<label>`. */
  id?: string;
  /** Clases CSS adicionales. */
  className?: string;
}

/**
 * Componente TextInput reutilizable.
 * Hereda los estilos de `input` definidos en `index.css` y normaliza
 * la interfaz a `onChange(value: string)` en lugar del evento nativo.
 *
 * @param {TextInputProps} props - Propiedades del componente.
 * @returns {JSX.Element} El input renderizado.
 */
export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  autoFocus = false,
  maxLength,
  id,
  className = '',
}) => (
  <input
    id={id}
    type={type}
    value={value}
    placeholder={placeholder}
    required={required}
    autoFocus={autoFocus}
    maxLength={maxLength}
    className={`text-input${className ? ` ${className}` : ''}`}
    onChange={(e) => onChange(e.target.value)}
  />
);
