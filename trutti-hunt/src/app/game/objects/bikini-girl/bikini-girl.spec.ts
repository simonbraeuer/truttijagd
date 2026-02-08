import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BikiniGirl, DelicateBikiniGirl } from './bikini-girl';

describe('BikiniGirl', () => {
  let bikiniGirl: BikiniGirl;
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
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
      bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60);
      
      expect(bikiniGirl.x).toBe(100);
      expect(bikiniGirl.y).toBe(200);
    });
  });

  describe('draw', () => {
    it('should call canvas context methods', () => {
      bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60);
      bikiniGirl.draw(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalled();
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('should not draw hearts emoji in normal situation', () => {
      bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60);
      bikiniGirl.draw(mockCtx);
      
      expect(mockCtx.fillText).not.toHaveBeenCalled();
    });
  });

  describe('onClick', () => {
    beforeEach(() => {
      bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60);
    });

    it('should return -50 money penalty', () => {
      const result = bikiniGirl.onClick(new Set());
      expect(result.moneyChange).toBe(-50);
    });

    it('should remove bikini girl', () => {
      const result = bikiniGirl.onClick(new Set());
      expect(result.shouldRemove).toBe(true);
    });

    it('should not have special turkey properties', () => {
      const result = bikiniGirl.onClick(new Set());
      
      expect(result.caughtSpecialId).toBeUndefined();
      expect(result.completionMessage).toBeUndefined();
      expect(result.shouldEndGame).toBeUndefined();
    });
  });

  describe('getType', () => {
    it('should return bikini-girl type', () => {
      bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60);
      expect(bikiniGirl.getType()).toBe('bikini-girl');
    });
  });

  describe('update', () => {
    it('should update position based on velocity', () => {
      bikiniGirl = new BikiniGirl(100, 200, 5, -3, 50, 60);
      const initialX = bikiniGirl.x;
      const initialY = bikiniGirl.y;
      
      bikiniGirl.update(800, 600, 'Andi');
      
      expect(bikiniGirl.x).toBe(initialX + bikiniGirl.vx);
      expect(bikiniGirl.y).toBe(initialY + bikiniGirl.vy);
    });

    it('should bounce off edges', () => {
      bikiniGirl = new BikiniGirl(100, -5, 5, -3, 50, 60);
      
      bikiniGirl.update(800, 600, 'Andi');
      
      expect(bikiniGirl.vy).toBe(3); // Velocity reversed
    });
  });
});

describe('DelicateBikiniGirl', () => {
  let delicateBikiniGirl: DelicateBikiniGirl;
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
    it('should create bikini girl in delicate situation', () => {
      delicateBikiniGirl = new DelicateBikiniGirl(100, 200, 5, -3, 50, 60);
      
      expect(delicateBikiniGirl.x).toBe(100);
      expect(delicateBikiniGirl.y).toBe(200);
    });
  });

  describe('draw', () => {
    it('should call canvas context methods', () => {
      delicateBikiniGirl = new DelicateBikiniGirl(100, 200, 5, -3, 50, 60);
      delicateBikiniGirl.draw(mockCtx);
      
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalled();
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('should draw hearts emoji when in delicate situation', () => {
      delicateBikiniGirl = new DelicateBikiniGirl(100, 200, 5, -3, 50, 60);
      delicateBikiniGirl.draw(mockCtx);
      
      expect(mockCtx.fillText).toHaveBeenCalledWith('💕', 0, expect.any(Number));
    });
  });

  describe('onClick', () => {
    beforeEach(() => {
      delicateBikiniGirl = new DelicateBikiniGirl(100, 200, 5, -3, 50, 60);
    });

    it('should return +100 money', () => {
      const result = delicateBikiniGirl.onClick(new Set());
      expect(result.moneyChange).toBe(100);
    });

    it('should remove bikini girl', () => {
      const result = delicateBikiniGirl.onClick(new Set());
      expect(result.shouldRemove).toBe(true);
    });
  });

  describe('getType', () => {
    it('should return delicate-bikini-girl type', () => {
      delicateBikiniGirl = new DelicateBikiniGirl(100, 200, 5, -3, 50, 60);
      expect(delicateBikiniGirl.getType()).toBe('delicate-bikini-girl');
    });
  });

  describe('update', () => {
    it('should update position based on velocity', () => {
      delicateBikiniGirl = new DelicateBikiniGirl(100, 200, 5, -3, 50, 60);
      const initialX = delicateBikiniGirl.x;
      const initialY = delicateBikiniGirl.y;
      
      delicateBikiniGirl.update(800, 600, 'Andi');
      
      expect(delicateBikiniGirl.x).toBe(initialX + delicateBikiniGirl.vx);
      expect(delicateBikiniGirl.y).toBe(initialY + delicateBikiniGirl.vy);
    });

    it('should bounce off edges', () => {
      delicateBikiniGirl = new DelicateBikiniGirl(100, -5, 5, -3, 50, 60);
      
      delicateBikiniGirl.update(800, 600, 'Andi');
      
      expect(delicateBikiniGirl.vy).toBe(3); // Velocity reversed
    });
  });
});
