import { GameObject, GameObjectClickResult } from './game-object';

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

  override getType(): string {
    return 'bikini-girl';
  }
}
