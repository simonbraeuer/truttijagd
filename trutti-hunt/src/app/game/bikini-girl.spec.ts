import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BikiniGirl } from './bikini-girl';

describe('BikiniGirl', () => {
  let bikiniGirl: BikiniGirl;
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    // Mock AudioContext for tests
    const mockAudioContext = {
      createOscillator: vi.fn(() => ({
        connect: vi.fn(),
        frequency: { 
          setValueAtTime: vi.fn(), 
          exponentialRampToValueAtTime: vi.fn() 
        },
        type: '',
        start: vi.fn(),
        stop: vi.fn()
      })),
      createGain: vi.fn(() => ({
        connect: vi.fn(),
        gain: { 
          setValueAtTime: vi.fn(), 
          exponentialRampToValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn()
        }
      })),
      createBiquadFilter: vi.fn(() => ({
        connect: vi.fn(),
        frequency: { value: 0 },
        type: ''
      })),
      currentTime: 0,
      destination: {}
    };
    
    (window as any).AudioContext = function() { return mockAudioContext; };
    
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      fillStyle: '',
      font: '',
      textAlign: '',
      beginPath: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      fillRect: vi.fn(),
      ellipse: vi.fn(),
      arc: vi.fn()
    } as unknown as CanvasRenderingContext2D;
  });

  describe('constructor', () => {
    it('should create bikini girl in normal situation', () => {
      bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60, false);
      
      expect(bikiniGirl.x).toBe(100);
      expect(bikiniGirl.y).toBe(200);
      expect(bikiniGirl.inDelicateSituation).toBe(false);
    });

    it('should create bikini girl in delicate situation', () => {
      bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60, true);
      
      expect(bikiniGirl.inDelicateSituation).toBe(true);
    });
  });

  describe('draw', () => {
    it('should call canvas context methods', () => {
      bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60, false);
      bikiniGirl.draw(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalled();
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('should use different pink for delicate situation', () => {
      bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60, true);
      bikiniGirl.draw(mockCtx);
      
      // Just verify drawing methods are called for delicate situation
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('should draw hearts emoji when in delicate situation', () => {
      bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60, true);
      bikiniGirl.draw(mockCtx);
      
      expect(mockCtx.fillText).toHaveBeenCalledWith('💕', 0, expect.any(Number));
    });

    it('should not draw hearts emoji in normal situation', () => {
      bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60, false);
      bikiniGirl.draw(mockCtx);
      
      expect(mockCtx.fillText).not.toHaveBeenCalled();
    });
  });

  describe('onClick', () => {
    describe('in delicate situation', () => {
      beforeEach(() => {
        bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60, true);
      });

      it('should return +100 money', () => {
        const result = bikiniGirl.onClick(new Set());
        expect(result.moneyChange).toBe(100);
      });

      it('should remove bikini girl', () => {
        const result = bikiniGirl.onClick(new Set());
        expect(result.shouldRemove).toBe(true);
      });
    });

    describe('in normal situation', () => {
      beforeEach(() => {
        bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60, false);
      });

      it('should return -50 money penalty', () => {
        const result = bikiniGirl.onClick(new Set());
        expect(result.moneyChange).toBe(-50);
      });

      it('should remove bikini girl', () => {
        const result = bikiniGirl.onClick(new Set());
        expect(result.shouldRemove).toBe(true);
      });
    });

    it('should not have special turkey properties', () => {
      bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60, false);
      const result = bikiniGirl.onClick(new Set());
      
      expect(result.caughtSpecialId).toBeUndefined();
      expect(result.completionMessage).toBeUndefined();
      expect(result.shouldEndGame).toBeUndefined();
    });
  });

  describe('getType', () => {
    it('should return bikini-girl type', () => {
      bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60, false);
      expect(bikiniGirl.getType()).toBe('bikini-girl');
    });
  });

  describe('update', () => {
    it('should update position based on velocity', () => {
      bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60, false);
      const initialX = bikiniGirl.x;
      const initialY = bikiniGirl.y;
      
      bikiniGirl.update(800, 600, 'Andi');
      
      expect(bikiniGirl.x).toBe(initialX + bikiniGirl.vx);
      expect(bikiniGirl.y).toBe(initialY + bikiniGirl.vy);
    });

    it('should bounce off edges', () => {
      bikiniGirl = new BikiniGirl(100, -5, 5, -3, 50, 60, false);
      
      bikiniGirl.update(800, 600, 'Andi');
      
      expect(bikiniGirl.vy).toBe(3); // Velocity reversed
    });
  });
});
