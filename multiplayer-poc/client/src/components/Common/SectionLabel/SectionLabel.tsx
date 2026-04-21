import React from 'react';
import './SectionLabel.scss';

/**
 * Propiedades del componente SectionLabel.
 */
interface SectionLabelProps {
  /** Texto de la etiqueta. */
  children: React.ReactNode;
  /** Alineación del texto. Por defecto: 'left'. */
  align?: 'left' | 'center' | 'right';
}

/**
 * Componente SectionLabel: etiqueta descriptiva pequeña para encabezar secciones de formulario.
 * Ejemplo de uso: "Selecciona tu personaje:", "Jugadores conectados:".
 *
 * @param {SectionLabelProps} props - Propiedades del componente.
 * @returns {JSX.Element} La etiqueta renderizada.
 */
export const SectionLabel: React.FC<SectionLabelProps> = ({
  children,
  align = 'left',
}) => (
  <p className={`section-label section-label--${align}`}>
    {children}
  </p>
);
