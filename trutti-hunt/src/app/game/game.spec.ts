import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GameComponent } from './game';
import { ChangeDetectorRef } from '@angular/core';

describe('GameComponent Core Logic', () => {
  let component: GameComponent;
  let mockCdr: { detectChanges: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockCdr = { detectChanges: vi.fn() };
    
    TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        { provide: ChangeDetectorRef, useValue: mockCdr }
      ]
    });

    const fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.money).toBe(0);
      expect(component.gameStarted).toBe(false);
      expect(component.gameOver).toBe(false);
      expect(component.paused).toBe(false);
      expect(component.timeRemaining).toBe(90);
    });

    it('should initialize with Andi difficulty by default', () => {
      expect(component.difficulty).toBe('Andi');
    });

    it('should initialize caught special turkeys set as empty', () => {
      expect(component.caughtSpecialTurkeys.size).toBe(0);
    });
  });

  describe('difficulty icons', () => {
    it('should return chicken icon for Andi', () => {
      component.difficulty = 'Andi';
      expect(component.getTurkeyIcon()).toBe('🐔');
    });

    it('should return turkey icon for Schuh', () => {
      component.difficulty = 'Schuh';
      expect(component.getTurkeyIcon()).toBe('🦃');
    });

    it('should return fire icon for Mexxx', () => {
      component.difficulty = 'Mexxx';
      expect(component.getTurkeyIcon()).toBe('🔥');
    });
  });

  describe('difficulty change', () => {
    it('should update difficulty when changed', () => {
      component.onDifficultyChange('Mexxx');
      expect(component.difficulty).toBe('Mexxx');
    });

    it('should handle all difficulty levels', () => {
      component.onDifficultyChange('Andi');
      expect(component.difficulty).toBe('Andi');
      
      component.onDifficultyChange('Schuh');
      expect(component.difficulty).toBe('Schuh');
      
      component.onDifficultyChange('Mexxx');
      expect(component.difficulty).toBe('Mexxx');
    });
  });

  describe('pause functionality', () => {
    it('should toggle pause state', () => {
      component.paused = false;
      component.togglePause();
      expect(component.paused).toBe(true);
      
      component.togglePause();
      expect(component.paused).toBe(false);
    });
  });

  describe('object size calculation', () => {
    beforeEach(() => {
      component['CANVAS_WIDTH'] = 800;
      component['CANVAS_HEIGHT'] = 600;
    });

    it('should return larger size for Andi difficulty', () => {
      component.difficulty = 'Andi';
      const size = component['getObjectSize']();
      
      expect(size.width).toBe(72); // 800 * 0.09
      expect(size.height).toBe(54); // 600 * 0.09
      expect(size.speedMultiplier).toBe(1);
    });

    it('should return medium size for Schuh difficulty', () => {
      component.difficulty = 'Schuh';
      const size = component['getObjectSize']();
      
      expect(size.width).toBe(48); // 800 * 0.06
      expect(size.height).toBe(48); // 600 * 0.08
      expect(size.speedMultiplier).toBe(1.5);
    });

    it('should return smaller size for Mexxx difficulty', () => {
      component.difficulty = 'Mexxx';
      const size = component['getObjectSize']();
      
      expect(size.width).toBe(44); // 800 * 0.055
      expect(size.height).toBe(40); // min 40 (600 * 0.055 = 33)
      expect(size.speedMultiplier).toBe(2);
    });

    it('should respect minimum dimensions', () => {
      component['CANVAS_WIDTH'] = 100;
      component['CANVAS_HEIGHT'] = 100;
      component.difficulty = 'Mexxx';
      
      const size = component['getObjectSize']();
      
      expect(size.width).toBeGreaterThanOrEqual(40);
      expect(size.height).toBeGreaterThanOrEqual(40);
    });
  });

  describe('special turkey tracking', () => {
    it('should track caught special turkeys', () => {
      expect(component.caughtSpecialTurkeys.size).toBe(0);
      
      component.caughtSpecialTurkeys.add(1);
      component.caughtSpecialTurkeys.add(5);
      component.caughtSpecialTurkeys.add(9);
      
      expect(component.caughtSpecialTurkeys.size).toBe(3);
      expect(component.caughtSpecialTurkeys.has(1)).toBe(true);
      expect(component.caughtSpecialTurkeys.has(5)).toBe(true);
      expect(component.caughtSpecialTurkeys.has(9)).toBe(true);
    });

    it('should not add duplicate special turkeys', () => {
      component.caughtSpecialTurkeys.add(1);
      component.caughtSpecialTurkeys.add(1);
      component.caughtSpecialTurkeys.add(1);
      
      expect(component.caughtSpecialTurkeys.size).toBe(1);
    });
  });

  describe('scoreboard management', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should save score to localStorage', () => {
      component.money = 500;
      component.difficulty = 'Schuh';
      component['scoreboard'] = [];
      
      component.saveScore('Test Player');
      
      const saved = localStorage.getItem('truttihunt-scoreboard');
      expect(saved).toBeTruthy();
      
      if (saved) {
        const scoreboard = JSON.parse(saved);
        expect(scoreboard.length).toBe(1);
        expect(scoreboard[0].name).toBe('Test Player');
        expect(scoreboard[0].score).toBe(500);
        expect(scoreboard[0].difficulty).toBe('Schuh');
      }
    });

    it('should sort scoreboard by score descending', () => {
      component.money = 300;
      component.difficulty = 'Andi';
      component['scoreboard'] = [
        { name: 'Player 1', score: 100, date: new Date().toISOString(), difficulty: 'Andi' },
        { name: 'Player 2', score: 500, date: new Date().toISOString(), difficulty: 'Schuh' }
      ];
      
      component.saveScore('Player 3');
      
      expect(component['scoreboard'][0].score).toBe(500);
      expect(component['scoreboard'][1].score).toBe(300);
      expect(component['scoreboard'][2].score).toBe(100);
    });

    it('should keep only top 5 scores', () => {
      component['scoreboard'] = Array.from({ length: 5 }, (_, i) => ({
        name: `Player ${i}`,
        score: i * 100,
        date: new Date().toISOString(),
        difficulty: 'Andi' as const
      }));
      
      component.money = 1000;
      component.difficulty = 'Mexxx';
      component.saveScore('Top Player');
      
      expect(component['scoreboard'].length).toBe(5);
      expect(component['scoreboard'][0].score).toBe(1000);
    });

    it('should load scoreboard from localStorage', () => {
      const mockScoreboard = [
        { name: 'Player 1', score: 500, date: new Date().toISOString(), difficulty: 'Schuh' },
        { name: 'Player 2', score: 300, date: new Date().toISOString(), difficulty: 'Andi' }
      ];
      localStorage.setItem('truttihunt-scoreboard', JSON.stringify(mockScoreboard));
      
      component.loadScoreboard();
      
      expect(component['scoreboard'].length).toBe(2);
      expect(component['scoreboard'][0].name).toBe('Player 1');
      expect(component['scoreboard'][1].name).toBe('Player 2');
    });

    it('should migrate old scoreboard entries without difficulty', () => {
      const oldScoreboard = [
        { name: 'Old Player', score: 200, date: new Date().toISOString() }
      ];
      localStorage.setItem('truttihunt-scoreboard', JSON.stringify(oldScoreboard));
      
      component.loadScoreboard();
      
      expect(component['scoreboard'][0].difficulty).toBe('Andi');
    });
  });

  describe('game qualification', () => {
    beforeEach(() => {
      component['scoreboard'] = [];
    });

    it('should qualify with less than 5 scores', () => {
      component['scoreboard'] = [
        { name: 'Player 1', score: 100, date: new Date().toISOString(), difficulty: 'Andi' }
      ];
      component.money = 50;
      
      component.endGame();
      
      expect(component.qualifiesForTop10).toBe(true);
    });

    it('should qualify with score higher than lowest in top 5', () => {
      component['scoreboard'] = Array.from({ length: 5 }, (_, i) => ({
        name: `Player ${i}`,
        score: (i + 1) * 100,
        date: new Date().toISOString(),
        difficulty: 'Andi' as const
      }));
      component.money = 600;
      
      component.endGame();
      
      expect(component.qualifiesForTop10).toBe(true);
    });

    it('should not qualify with score lower than lowest in top 5', () => {
      component['scoreboard'] = Array.from({ length: 5 }, (_, i) => ({
        name: `Player ${i}`,
        score: (i + 2) * 100,
        date: new Date().toISOString(),
        difficulty: 'Andi' as const
      }));
      component.money = 50;
      component['loadScoreboard'] = vi.fn(); // Mock to prevent loading from localStorage
      
      component.endGame();
      
      expect(component.showScoreboard).toBe(true); // Should show scoreboard when not qualifying
    });
  });

  describe('game reset', () => {
    it('should reset all game state', () => {
      // Set up game state
      component.gameStarted = true;
      component.gameOver = true;
      component.money = 500;
      component.showScoreboard = true;
      component.qualifiesForTop10 = true;
      component.completionMessage = 'Test message';
      
      component.resetGame();
      
      expect(component.gameStarted).toBe(false);
      expect(component.gameOver).toBe(false);
      expect(component.showScoreboard).toBe(false);
      expect(component.qualifiesForTop10).toBe(false);
      expect(component.completionMessage).toBe('');
    });
  });

  describe('object spawning direction', () => {
    beforeEach(() => {
      component['CANVAS_WIDTH'] = 800;
      component['CANVAS_HEIGHT'] = 600;
      component.difficulty = 'Andi';
      component.caughtSpecialTurkeys = new Set();
      component['spawnedSpecialTurkeys'] = new Set();
      component.timeRemaining = 90;
    });

    it('should spawn objects on left side moving right (positive vx)', () => {
      const randomSpy = vi.spyOn(Math, 'random');
      
      // Mock sequence:
      // 1st: rand for type selection (< 0.5 = turkey)
      randomSpy.mockReturnValueOnce(0.3);
      // 2nd: x position (< 0.5 = left side)
      randomSpy.mockReturnValueOnce(0.2);
      // 3rd: y position
      randomSpy.mockReturnValueOnce(0.5);
      // 4th: vx magnitude
      randomSpy.mockReturnValueOnce(0.5);
      // 5th: vy
      randomSpy.mockReturnValueOnce(0.5);
      
      component['spawnObject']();
      
      const spawnedObject = component['gameObjects'][0];
      expect(spawnedObject.x).toBeLessThan(0); // Spawned on left (-50)
      expect(spawnedObject.vx).toBeGreaterThan(0); // Moving right (positive)
      
      randomSpy.mockRestore();
    });

    it('should spawn objects on right side moving left (negative vx)', () => {
      const randomSpy = vi.spyOn(Math, 'random');
      
      // Mock sequence:
      // 1st: rand for type selection (< 0.5 = turkey)
      randomSpy.mockReturnValueOnce(0.3);
      // 2nd: x position (>= 0.5 = right side)
      randomSpy.mockReturnValueOnce(0.8);
      // 3rd: y position
      randomSpy.mockReturnValueOnce(0.5);
      // 4th: vx magnitude
      randomSpy.mockReturnValueOnce(0.5);
      // 5th: vy
      randomSpy.mockReturnValueOnce(0.5);
      
      component['spawnObject']();
      
      const spawnedObject = component['gameObjects'][0];
      expect(spawnedObject.x).toBeGreaterThan(component['CANVAS_WIDTH']); // Spawned on right (850)
      expect(spawnedObject.vx).toBeLessThan(0); // Moving left (negative)
      
      randomSpy.mockRestore();
    });

    it('should consistently spawn left objects moving right over multiple spawns', () => {
      const randomSpy = vi.spyOn(Math, 'random');
      
      // Test 5 left-side spawns
      for (let i = 0; i < 5; i++) {
        component['gameObjects'] = []; // Clear previous objects
        
        // Type selection
        randomSpy.mockReturnValueOnce(0.3);
        // x position (left)
        randomSpy.mockReturnValueOnce(0.1);
        // y position
        randomSpy.mockReturnValueOnce(0.5);
        // vx magnitude
        randomSpy.mockReturnValueOnce(0.5);
        // vy
        randomSpy.mockReturnValueOnce(0.5);
        
        component['spawnObject']();
        
        const obj = component['gameObjects'][0];
        expect(obj.x).toBeLessThan(0);
        expect(obj.vx).toBeGreaterThan(0);
      }
      
      randomSpy.mockRestore();
    });

    it('should consistently spawn right objects moving left over multiple spawns', () => {
      const randomSpy = vi.spyOn(Math, 'random');
      
      // Test 5 right-side spawns
      for (let i = 0; i < 5; i++) {
        component['gameObjects'] = []; // Clear previous objects
        
        // Type selection
        randomSpy.mockReturnValueOnce(0.3);
        // x position (right)
        randomSpy.mockReturnValueOnce(0.9);
        // y position
        randomSpy.mockReturnValueOnce(0.5);
        // vx magnitude
        randomSpy.mockReturnValueOnce(0.5);
        // vy
        randomSpy.mockReturnValueOnce(0.5);
        
        component['spawnObject']();
        
        const obj = component['gameObjects'][0];
        expect(obj.x).toBeGreaterThan(component['CANVAS_WIDTH']);
        expect(obj.vx).toBeLessThan(0);
      }
      
      randomSpy.mockRestore();
    });
  });
});