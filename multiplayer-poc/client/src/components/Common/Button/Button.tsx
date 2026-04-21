import React from 'react';
import './Button.scss';

/**
 * Variantes visuales del botón.
 * - `primary`: fondo dorado (estilo global por defecto).
 * - `secondary`: borde y texto cyan.
 * - `ghost`: sin fondo ni borde, ideal para navegación (← Volver).
 */
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

/**
 * Propiedades del componente Button.
 */
interface ButtonProps {
  /** Variante visual del botón. Por defecto: 'primary'. */
  variant?: ButtonVariant;
  /** Tipo HTML del botón. Por defecto: 'button'. */
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  /** Deshabilita la interacción. */
  disabled?: boolean;
  /** Muestra estado de carga ("Conectando..."). También deshabilita el botón. */
  loading?: boolean;
  /** Handler de clic. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Clases CSS adicionales para overrides puntuales. */
  className?: string;
  /** Texto alternativo para accesibilidad. */
  'aria-label'?: string;
  /** Tooltip nativo del navegador. */
  title?: string;
  /** Contenido del botón. */
  children: React.ReactNode;
}

/**
 * Componente Button reutilizable con soporte de variantes visuales.
 * Hereda los estilos base del `button` global definido en `index.css`.
 *
 * @param {ButtonProps} props - Propiedades del componente.
 * @returns {JSX.Element} El botón renderizado.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  children,
  title,
  ...rest
}) => {
  /** Mapeo de variante a clase CSS (hereda estilos globales de index.css). */
  const variantClass: Record<ButtonVariant, string> = {
    primary:   '',
    secondary: 'secondary',
    ghost:     'btn-back',
  };

  const classes = [variantClass[variant], className].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classes || undefined}
      onClick={onClick}
      title={title}
      aria-label={rest['aria-label']}
    >
      {loading ? <span>Conectando...</span> : children}
    </button>
  );
};
