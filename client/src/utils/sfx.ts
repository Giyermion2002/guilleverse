/**
 * Motor de Audio Sintetizado para Guilleverse.
 * Utiliza la Web Audio API para generar sonidos dinámicamente sin depender de archivos externos.
 */

class SoundEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;

  /**
   * Inicializa el contexto de audio. Debe llamarse tras una interacción del usuario.
   */
  public init() {
    if (this.context) return;
    
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    console.log('Motor de audio inicializado');
  }

  /**
   * Genera un sonido de "click" mágico (percusivo y resonante).
   */
  public playClick() {
    if (!this.context || !this.masterGain || this.isMuted) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.context.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.context.currentTime + 0.1);
  }

  /**
   * Genera un sonido de unión a sala (barrido ascendente).
   */
  public playJoin() {
    if (!this.context || !this.masterGain || this.isMuted) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.context.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.context.currentTime + 0.3);
  }

  /**
   * Cambia el estado de silencio global.
   * @param muted true para silenciar, false para activar.
   */
  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, this.context!.currentTime, 0.1);
    }
  }
}

export const engine = new SoundEngine();

/**
 * Función de compatibilidad para mantener las llamadas existentes de playSFX.
 * @param sound Tipo de sonido a reproducir.
 */
export const playSFX = (sound: string) => {
  engine.init(); // Intentar inicializar en cada interacción
  if (sound === 'click') engine.playClick();
  if (sound === 'join') engine.playJoin();
};
