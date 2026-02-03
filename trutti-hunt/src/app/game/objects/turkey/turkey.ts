import type { DifficultyLevel } from '../../components/start-screen/start-screen';
import { GameObject, GameObjectClickResult } from '../game-object';

export class Turkey extends GameObject {
  protected static readonly TAIL_COLORS = ['#8B4513', '#A0522D', '#D2691E'];
  protected static readonly TWO_PI = Math.PI * 2;
  constructor(x: number, y: number, vx: number, vy: number, width: number, height: number) {
    super(x, y, vx, vy, width, height);
  }

  protected override applyDifficultyBehavior(difficulty: DifficultyLevel): void {
    if (difficulty === 'Mexxx') {
      // Random chance to bounce (5% per frame)
      if (Math.random() < 0.05) {
        this.vy *= -1;
        // Add some randomness to the bounce angle
        this.vy += (Math.random() - 0.5) * 2;
      }
    }
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    const w = this.width;
    const h = this.height;

    this.drawBody(ctx, w, h, '#8B4513', '#A0522D');
    this.drawBeak(ctx, w, h, '#FFA500');
    this.drawEye(ctx, w, h);
    this.drawTailFeathers(ctx, w, h, Turkey.TAIL_COLORS);

    ctx.restore();
  }

  protected drawBody(ctx: CanvasRenderingContext2D, w: number, h: number, bodyColor: string, headColor: string): void {
    // Turkey body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.35, h * 0.4, 0, 0, Turkey.TWO_PI);
    ctx.fill();

    // Head
    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.arc(-w * 0.25, -h * 0.25, w * 0.2, 0, Turkey.TWO_PI);
    ctx.fill();
  }

  protected drawBeak(ctx: CanvasRenderingContext2D, w: number, h: number, beakColor: string): void {
    ctx.fillStyle = beakColor;
    ctx.beginPath();
    ctx.moveTo(-w * 0.35, -h * 0.25);
    ctx.lineTo(-w * 0.45, -h * 0.22);
    ctx.lineTo(-w * 0.35, -h * 0.19);
    ctx.closePath();
    ctx.fill();
  }

  protected drawEye(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-w * 0.28, -h * 0.28, w * 0.03, 0, Turkey.TWO_PI);
    ctx.fill();
  }

  protected drawTailFeathers(ctx: CanvasRenderingContext2D, w: number, h: number, colors: readonly string[]): void {
    const yStep = h * 0.1;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.ellipse(w * 0.25, -h * 0.1 + i * yStep, w * 0.15, h * 0.25, Math.PI / 6, 0, Turkey.TWO_PI);
      ctx.fill();
    }
  }

  override onClick(caughtSpecialTurkeys: Set<number>): GameObjectClickResult {
    return {
      moneyChange: 10,
      shouldRemove: true
    };
  }

  override getType(): string {
    return 'turkey';
  }
}

export class SpecialTurkey extends Turkey {
  private static readonly GOLDEN_COLORS = ['#FFD700', '#FFA500', '#FF8C00'] as const;
  
  specialId: number;
  isLastSpecial: boolean;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    width: number,
    height: number,
    specialId: number,
    isLastSpecial: boolean = false
  ) {
    super(x, y, vx, vy, width, height);
    this.specialId = specialId;
    this.isLastSpecial = isLastSpecial;
  }

  override draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    const w = this.width;
    const h = this.height;

    // Reuse parent drawing methods with golden colors
    this.drawBody(ctx, w, h, '#FFD700', '#FFA500');
    this.drawBeak(ctx, w, h, '#FF8C00');
    this.drawEye(ctx, w, h);
    this.drawTailFeathers(ctx, w, h, SpecialTurkey.GOLDEN_COLORS);

    // Draw special number
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${h * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.specialId.toString(), 0, 0);

    ctx.restore();
  }

  override onClick(caughtSpecialTurkeys: Set<number>): GameObjectClickResult {
    const allCaught = caughtSpecialTurkeys.size === 8; // Will be 9 after adding this one

    if (allCaught) {
      return {
        moneyChange: 550, // 50 for this turkey + 500 bonus
        shouldRemove: true,
        caughtSpecialId: this.specialId,
        completionMessage: '🎉 All 9 Truttis caught! +$500 bonus! 🎉',
        shouldEndGame: true,
        endGameDelay: 2000
      };
    }

    return {
      moneyChange: 50,
      shouldRemove: true,
      caughtSpecialId: this.specialId
    };
  }

  override getType(): string {
    return 'special-turkey';
  }
}
