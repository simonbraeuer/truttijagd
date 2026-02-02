import { describe, it, expect, beforeEach } from 'vitest';
import { GameObject, GameObjectClickResult } from './game-object';
import type { DifficultyLevel } from './components/start-screen/start-screen';

// Concrete test implementation of abstract GameObject
class TestGameObject extends GameObject {
  draw(ctx: CanvasRenderingContext2D): void {
    // Mock implementation
  }

  onClick(caughtSpecialTurkeys: Set<number>): GameObjectClickResult {
    return {
      moneyChange: 10,
      shouldRemove: true
    };
  }

  getType(): string {
    return 'test';
  }
}

describe('GameObject', () => {
  let gameObject: TestGameObject;

  beforeEach(() => {
    gameObject = new TestGameObject(100, 200, 5, -3, 50, 60);
  });

  describe('constructor', () => {
    it('should initialize with correct position', () => {
      expect(gameObject.x).toBe(100);
      expect(gameObject.y).toBe(200);
    });

    it('should initialize with correct velocity', () => {
      expect(gameObject.vx).toBe(5);
      expect(gameObject.vy).toBe(-3);
    });

    it('should initialize with correct dimensions', () => {
      expect(gameObject.width).toBe(50);
      expect(gameObject.height).toBe(60);
    });
  });

  describe('update', () => {
    const canvasWidth = 800;
    const canvasHeight = 600;

    it('should update position based on velocity', () => {
      const initialX = gameObject.x;
      const initialY = gameObject.y;
      
      gameObject.update(canvasWidth, canvasHeight, 'Andi');
      
      expect(gameObject.x).toBe(initialX + gameObject.vx);
      expect(gameObject.y).toBe(initialY + gameObject.vy);
    });

    it('should bounce off top edge', () => {
      gameObject.y = -5;
      gameObject.vy = -3;
      
      gameObject.update(canvasWidth, canvasHeight, 'Andi');
      
      expect(gameObject.vy).toBe(3); // Velocity reversed
    });

    it('should bounce off bottom edge', () => {
      gameObject.y = canvasHeight - gameObject.height + 10;
      gameObject.vy = 3;
      
      gameObject.update(canvasWidth, canvasHeight, 'Andi');
      
      expect(gameObject.vy).toBe(-3); // Velocity reversed
    });

    it('should not bounce when not at edges', () => {
      gameObject.y = 300;
      gameObject.vy = 3;
      
      gameObject.update(canvasWidth, canvasHeight, 'Andi');
      
      expect(gameObject.vy).toBe(3); // Velocity unchanged
    });
  });

  describe('applyDifficultyBehavior', () => {
    it('should be callable without throwing', () => {
      expect(() => {
        gameObject['applyDifficultyBehavior']('Andi');
      }).not.toThrow();
    });
  });

  describe('abstract methods', () => {
    it('should implement draw method', () => {
      const mockCtx = {} as CanvasRenderingContext2D;
      expect(() => gameObject.draw(mockCtx)).not.toThrow();
    });

    it('should implement onClick method', () => {
      const result = gameObject.onClick(new Set());
      expect(result).toBeDefined();
      expect(result.moneyChange).toBe(10);
      expect(result.shouldRemove).toBe(true);
    });

    it('should implement getType method', () => {
      expect(gameObject.getType()).toBe('test');
    });
  });
});
