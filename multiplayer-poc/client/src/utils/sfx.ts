/**
 * Colección de objetos Audio para los efectos sonoros del juego.
 * Los sonidos se cargan desde URLs externas para esta PoC.
 */
const sounds = {
  /** Sonido de click para botones e interacciones generales. */
  click: new Audio('https://www.soundjay.com/buttons/sounds/button-16.mp3'),
  /** Sonido de unión exitosa a una sala. */
  join: new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3'),
  /** Sonido de rayo/trueno para eventos épicos. */
  lightning: new Audio('https://www.soundjay.com/nature/sounds/thunder-01.mp3'),
  /** Sonido de dados rodando (para el Selector Mágico). */
  dice: new Audio('https://www.soundjay.com/misc/sounds/dice-roll-1.mp3')
};

/**
 * Reproduce un efecto de sonido específico.
 * Reinicia el tiempo de reproducción a 0 antes de cada ejecución para permitir sonidos rápidos.
 * 
 * @param {keyof typeof sounds} sound - El identificador del sonido a reproducir.
 */
export const playSFX = (sound: keyof typeof sounds) => {
  try {
    const audio = sounds[sound];
    if (audio) {
      // Reiniciar el audio para permitir repeticiones instantáneas
      audio.currentTime = 0;
      audio.play().catch(e => console.warn(`SFX ${sound} bloqueado por el navegador:`, e));
    }
  } catch (err) {
    console.error('Error al intentar reproducir SFX:', err);
  }
};
