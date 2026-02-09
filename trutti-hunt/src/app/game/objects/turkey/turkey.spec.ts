import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Turkey, SpecialTurkey } from './turkey';

describe('Turkey', () => {
  let turkey: Turkey;
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    turkey = new Turkey(100, 200, 5, -3, 50, 60);
    
    // Create minimal mock canvas context
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      fillStyle: '',
      beginPath: vi.fn(),
      fill: vi.fn(),
      ellipse: vi.fn(),
      arc: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      quadraticCurveTo: vi.fn()
    } as unknown as CanvasRenderingContext2D;
  });

  describe('constructor', () => {
    it('should create turkey with correct properties', () => {
      expect(turkey.x).toBe(100);
      expect(turkey.y).toBe(200);
      expect(turkey.vx).toBe(5);
      expect(turkey.vy).toBe(-3);
      expect(turkey.width).toBe(50);
      expect(turkey.height).toBe(60);
    });
  });

  describe('applyDifficultyBehavior', () => {
    it('should not modify velocity on Andi difficulty', () => {
      const initialVy = turkey.vy;
      turkey['applyDifficultyBehavior']('Andi');
      expect(turkey.vy).toBe(initialVy);
    });

    it('should not modify velocity on Schuh difficulty', () => {
      const initialVy = turkey.vy;
      turkey['applyDifficultyBehavior']('Schuh');
      expect(turkey.vy).toBe(initialVy);
    });

    it('should potentially modify velocity on Mexxx difficulty', () => {
      // Run multiple times since it's random
      let changedAtLeastOnce = false;
      for (let i = 0; i < 100; i++) {
        const testTurkey = new Turkey(100, 200, 5, -3, 50, 60);
        const initialVy = testTurkey.vy;
        testTurkey['applyDifficultyBehavior']('Mexxx');
        if (testTurkey.vy !== initialVy) {
          changedAtLeastOnce = true;
          break;
        }
      }
      // With 100 iterations at 5% probability, it's extremely likely to change at least once
      expect(changedAtLeastOnce).toBe(true);
    });
  });

  describe('draw', () => {
    it('should call canvas context methods', () => {
      turkey.draw(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalled();
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });
  });

  describe('onClick', () => {
    it('should return +10 money', () => {
      const result = turkey.onClick(new Set());
      expect(result.moneyChange).toBe(10);
    });

    it('should remove turkey on click', () => {
      const result = turkey.onClick(new Set());
      expect(result.shouldRemove).toBe(true);
    });

    it('should not have special turkey properties', () => {
      const result = turkey.onClick(new Set());
      expect(result.caughtSpecialId).toBeUndefined();
      expect(result.completionMessage).toBeUndefined();
      expect(result.shouldEndGame).toBeUndefined();
    });
  });

  describe('getType', () => {
    it('should return turkey type', () => {
      expect(turkey.getType()).toBe('turkey');
    });
  });
});

describe('SpecialTurkey', () => {
  let specialTurkey: SpecialTurkey;
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    specialTurkey = new SpecialTurkey(100, 200, 5, -3, 50, 60, 5, false);
    
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
      beginPath: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      ellipse: vi.fn(),
      arc: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      quadraticCurveTo: vi.fn()
    } as unknown as CanvasRenderingContext2D;
  });

  describe('constructor', () => {
    it('should create special turkey with ID', () => {
      expect(specialTurkey.specialId).toBe(5);
    });

    it('should set isLastSpecial flag', () => {
      const lastTurkey = new SpecialTurkey(100, 200, 5, -3, 50, 60, 9, true);
      expect(lastTurkey.isLastSpecial).toBe(true);
    });

    it('should default isLastSpecial to false', () => {
      expect(specialTurkey.isLastSpecial).toBe(false);
    });
  });

  describe('draw', () => {
    it('should call canvas context methods', () => {
      specialTurkey.draw(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalled();
      expect(mockCtx.fillText).toHaveBeenCalled();
    });

    it('should draw special ID number', () => {
      specialTurkey.draw(mockCtx);
      expect(mockCtx.fillText).toHaveBeenCalledWith('5', 0, 0);
    });
  });

  describe('onClick', () => {
    it('should return +50 money for regular catch', () => {
      const caughtSet = new Set<number>([1, 2, 3]);
      const result = specialTurkey.onClick(caughtSet);
      
      expect(result.moneyChange).toBe(50);
      expect(result.shouldRemove).toBe(true);
      expect(result.caughtSpecialId).toBe(5);
    });

    it('should return +550 money when catching last turkey', () => {
      const caughtSet = new Set<number>([1, 2, 3, 4, 6, 7, 8, 9]); // 8 caught, this is #5 (9th)
      const result = specialTurkey.onClick(caughtSet);
      
      expect(result.moneyChange).toBe(550);
      expect(result.shouldRemove).toBe(true);
      expect(result.caughtSpecialId).toBe(5);
      expect(result.completionMessage).toContain('All 9 Truttis caught');
      expect(result.shouldEndGame).toBe(true);
      expect(result.endGameDelay).toBe(2000);
    });

    it('should not trigger completion when not all caught', () => {
      const caughtSet = new Set<number>([1, 2]);
      const result = specialTurkey.onClick(caughtSet);
      
      expect(result.completionMessage).toBeUndefined();
      expect(result.shouldEndGame).toBeUndefined();
    });

    it('should add special turkey ID to result', () => {
      const result = specialTurkey.onClick(new Set());
      expect(result.caughtSpecialId).toBe(5);
    });
  });

  describe('getType', () => {
    it('should return special-turkey type', () => {
      expect(specialTurkey.getType()).toBe('special-turkey');
    });
  });

  describe('inheritance', () => {
    it('should inherit from Turkey', () => {
      expect(specialTurkey instanceof Turkey).toBe(true);
    });

    it('should inherit applyDifficultyBehavior', () => {
      expect(() => {
        specialTurkey['applyDifficultyBehavior']('Mexxx');
      }).not.toThrow();
    });
  });
});
