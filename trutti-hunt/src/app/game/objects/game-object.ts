import type { DifficultyLevel } from '../components/start-screen/start-screen';

export interface GameObjectClickResult {
  moneyChange: number;
  shouldRemove: boolean;
  caughtSpecialId?: number;
  completionMessage?: string;
  shouldEndGame?: boolean;
  endGameDelay?: number;
}

export abstract class GameObject {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;

  constructor(x: number, y: number, vx: number, vy: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.width = width;
    this.height = height;
  }

  update(canvasWidth: number, canvasHeight: number, difficulty: DifficultyLevel): void {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off top/bottom
    if (this.y < 0 || this.y > canvasHeight - this.height) {
      this.vy *= -1;
    }

    // Apply difficulty-specific behavior
    this.applyDifficultyBehavior(difficulty);
  }

  protected applyDifficultyBehavior(difficulty: DifficultyLevel): void {
    // Override in subclasses if needed
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;
  abstract onClick(caughtSpecialTurkeys: Set<number>): GameObjectClickResult;
  abstract getType(): string;
}
