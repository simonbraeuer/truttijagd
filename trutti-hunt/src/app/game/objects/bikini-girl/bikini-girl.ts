import { GameObject, GameObjectClickResult } from '../game-object';

export class BikiniGirl extends GameObject {
  inDelicateSituation: boolean;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    width: number,
    height: number,
    inDelicateSituation: boolean
  ) {
    super(x, y, vx, vy, width, height);
    this.inDelicateSituation = inDelicateSituation;
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    // Body
    ctx.fillStyle = '#FFE4C4';
    ctx.beginPath();
    ctx.ellipse(0, this.height * 0.05, this.width * 0.25, this.height * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(0, -this.height * 0.25, this.width * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Bikini top
    ctx.fillStyle = this.inDelicateSituation ? '#FF69B4' : '#FF1493';
    ctx.fillRect(-this.width * 0.2, -this.height * 0.05, this.width * 0.4, this.height * 0.15);

    // Bikini bottom
    ctx.fillRect(-this.width * 0.18, this.height * 0.25, this.width * 0.36, this.height * 0.15);

    // Hair
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(0, -this.height * 0.3, this.width * 0.2, 0, Math.PI, true);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-this.width * 0.08, -this.height * 0.27, this.width * 0.03, 0, Math.PI * 2);
    ctx.arc(this.width * 0.08, -this.height * 0.27, this.width * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Delicate situation indicator
    if (this.inDelicateSituation) {
      ctx.fillStyle = '#FF69B4';
      ctx.font = `${this.height * 0.3}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('💕', 0, -this.height * 0.5);
    }

    ctx.restore();
  }

  override onClick(caughtSpecialTurkeys: Set<number>): GameObjectClickResult {
    if (this.inDelicateSituation) {
      this.playKissSound();
      return {
        moneyChange: 100,
        shouldRemove: true
      };
    }

    return {
      moneyChange: -50,
      shouldRemove: true
    };
  }

  private playKissSound() {
    // Kiss sound effect using Web Audio API - simulates a "mwah" sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create two oscillators for a more realistic kiss sound
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure filter for softer, more realistic sound
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    
    // First oscillator: creates the "m" sound
    osc1.frequency.setValueAtTime(300, audioContext.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
    osc1.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 1.5);
    osc1.type = 'triangle';
    
    // Second oscillator: creates harmonics for the "wah" sound
    osc2.frequency.setValueAtTime(600, audioContext.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
    osc2.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 1.5);
    osc2.type = 'sine';
    
    // Envelope: longer duration for 2 second kiss sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 1.0);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2.0);
    
    osc1.start(audioContext.currentTime);
    osc2.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 2.0);
    osc2.stop(audioContext.currentTime + 2.0);
  }

  override getType(): string {
    return 'bikini-girl';
  }
}
