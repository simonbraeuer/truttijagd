import { GameObject, GameObjectClickResult } from '../game-object';
import type { DifficultyLevel } from '../../components/start-screen/start-screen';

export class BikiniGirl extends GameObject {
  private speedInitialized = false;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    width: number,
    height: number
  ) {
    super(x, y, vx, vy, width, height);
  }

  protected getSpeedMultiplier(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'Andi':
        return 1;
      case 'Schuh':
        return 1.8;
      case 'Mexxx':
        return 1; // Obstacles, not meant to be fast
    }
  }

  protected override applyDifficultyBehavior(difficulty: DifficultyLevel): void {
    // Only apply speed multiplier once on first update
    if (!this.speedInitialized) {
      const multiplier = this.getSpeedMultiplier(difficulty);
      this.vx *= multiplier;
      this.vy *= multiplier;
      this.speedInitialized = true;
    }
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    this.drawBody(ctx);
    this.drawBikini(ctx, '#FF1493');
    this.drawHair(ctx);
    this.drawEyes(ctx);

    ctx.restore();
  }

  protected drawBody(ctx: CanvasRenderingContext2D): void {
    // Body
    ctx.fillStyle = '#FFE4C4';
    ctx.beginPath();
    ctx.ellipse(0, this.height * 0.05, this.width * 0.25, this.height * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(0, -this.height * 0.25, this.width * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  protected drawBikini(ctx: CanvasRenderingContext2D, color: string): void {
    ctx.fillStyle = color;
    
    // Bikini top
    ctx.fillRect(-this.width * 0.2, -this.height * 0.05, this.width * 0.4, this.height * 0.15);

    // Bikini bottom
    ctx.fillRect(-this.width * 0.18, this.height * 0.25, this.width * 0.36, this.height * 0.15);
  }

  protected drawHair(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(0, -this.height * 0.3, this.width * 0.2, 0, Math.PI, true);
    ctx.fill();
  }

  protected drawEyes(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-this.width * 0.08, -this.height * 0.27, this.width * 0.03, 0, Math.PI * 2);
    ctx.arc(this.width * 0.08, -this.height * 0.27, this.width * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }

  override onClick(caughtSpecialTurkeys: Set<number>): GameObjectClickResult {
    return {
      moneyChange: -50,
      shouldRemove: true
    };
  }

  override getType(): string {
    return 'bikini-girl';
  }
}

export class DelicateBikiniGirl extends BikiniGirl {
  private spiralAngle: number = 0;
  private spiralRadius: number = 50;
  private spiralCenterX: number;
  private spiralCenterY: number;
  private waveTime: number = 0;
  private stopTimer: number = 0;
  private isStopped: boolean = false;
  private baseVx: number;
  private baseVy: number;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    width: number,
    height: number
  ) {
    super(x, y, vx, vy, width, height);
    this.spiralCenterX = x;
    this.spiralCenterY = y;
    this.baseVx = vx;
    this.baseVy = vy;
  }

  protected override getSpeedMultiplier(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'Andi':
        return 1;
      case 'Schuh':
        return 1.8;
      case 'Mexxx':
        return 0.5; // Slower and bigger obstacles on Mexxx
    }
  }

  override update(canvasWidth: number, canvasHeight: number, difficulty: DifficultyLevel): void {
    if (difficulty === 'Mexxx') {
      // Wave-like speed oscillation
      this.waveTime += 0.05;
      
      // Random stopping (5% chance per frame to start stopping)
      if (!this.isStopped && Math.random() < 0.01) {
        this.isStopped = true;
        this.stopTimer = 30; // Stop for about half a second (30 frames at 60fps)
      }
      
      // Handle stopping
      if (this.isStopped) {
        this.stopTimer--;
        if (this.stopTimer <= 0) {
          this.isStopped = false;
        }
      }
      
      // Apply wave-like speed (sine wave from 0.3 to 1.7 of base speed)
      const waveMultiplier = this.isStopped ? 0 : 1 + 0.7 * Math.sin(this.waveTime);
      
      // Spiral movement with wave-like speed
      this.spiralAngle += 0.15 * waveMultiplier;
      this.spiralRadius += 0.8 * waveMultiplier;
      
      // Update center position with wave speed
      this.spiralCenterX += this.vx * waveMultiplier;
      this.spiralCenterY += this.vy * waveMultiplier;
      
      // Calculate spiral position
      this.x = this.spiralCenterX + Math.cos(this.spiralAngle) * this.spiralRadius;
      this.y = this.spiralCenterY + Math.sin(this.spiralAngle) * this.spiralRadius;
      
      // Bounce center off top/bottom
      if (this.spiralCenterY < 0 || this.spiralCenterY > canvasHeight - this.height) {
        this.vy *= -1;
      }
      
      // Reset spiral if it gets too big
      if (this.spiralRadius > 150) {
        this.spiralRadius = 50;
      }
    } else {
      // Normal movement for other difficulties
      super.update(canvasWidth, canvasHeight, difficulty);
    }
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    this.drawBody(ctx);
    this.drawBikini(ctx, '#FF69B4'); // Pink color for delicate situation
    this.drawHair(ctx);
    this.drawEyes(ctx);

    // Delicate situation indicator
    ctx.fillStyle = '#FF69B4';
    ctx.font = `${this.height * 0.3}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('💕', 0, -this.height * 0.5);

    ctx.restore();
  }

  override onClick(caughtSpecialTurkeys: Set<number>): GameObjectClickResult {
    this.playKissSound();
    return {
      moneyChange: 100,
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
    return 'delicate-bikini-girl';
  }
}
