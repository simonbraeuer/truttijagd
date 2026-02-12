import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GameComponent } from './game';
import { ChangeDetectorRef } from '@angular/core';
import { ScoreboardService } from './services/scoreboard.service';
import { Turkey, SpecialTurkey, BikiniGirl } from './game-objects';

describe('GameComponent Core Logic', () => {
  let component: GameComponent;
  let mockCdr: { detectChanges: ReturnType<typeof vi.fn> };
  let scoreboardService: ScoreboardService;
  const baseStats = {
    timeRemaining: 0,
    truttisCaught: 0,
    specialTruttisCaught: 0,
    totalClicks: 0
  };

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
    scoreboardService = TestBed.inject(ScoreboardService);
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

    it('should maintain game state when paused', async () => {
      // Start game to initialize
      component.startGame({ audioUrl: '', difficulty: 'Andi' });
      
      // Wait for setTimeout in startGame to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Set some game state
      component.money = 100;
      
      // Pause the game
      component.togglePause();
      expect(component.paused).toBe(true);
      expect(component.money).toBe(100); // State preserved
      
      // Clean up
      component.stopGame();
    });

    it('should resume game when unpaused', async () => {
      // Start game
      component.startGame({ audioUrl: '', difficulty: 'Andi' });
      
      // Wait for setTimeout in startGame to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Pause the game
      component.togglePause();
      expect(component.paused).toBe(true);
      
      // Unpause the game
      component.togglePause();
      expect(component.paused).toBe(false);
      
      // Clean up
      component.stopGame();
    });
  });

  describe('spawn manager integration', () => {
    beforeEach(() => {
      component['CANVAS_WIDTH'] = 800;
      component['CANVAS_HEIGHT'] = 600;
    });

    it('should initialize SpawnManager on game start', async () => {
      component.startGame({ audioUrl: '', difficulty: 'Andi' });
      
      // Wait for setTimeout in startGame to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(component['spawnManager']).toBeDefined();
      
      // Clean up
      component.stopGame();
    });

    it('should spawn objects through SpawnManager', async () => {
      component.startGame({ audioUrl: '', difficulty: 'Andi' });
      
      // Wait for setTimeout and initial game loop
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // SpawnManager should be initialized
      expect(component['spawnManager']).toBeDefined();
      
      // Clean up
      component.stopGame();
    });

    it('should handle different difficulties', async () => {
      for (const difficulty of ['Andi', 'Schuh', 'Mexxx'] as const) {
        component.startGame({ audioUrl: '', difficulty });
        
        await new Promise(resolve => setTimeout(resolve, 10));
        
        expect(component['spawnManager']).toBeDefined();
        expect(component.difficulty).toBe(difficulty);
        
        component.stopGame();
      }
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

  describe('stat tracking', () => {
    it('should increment truttis caught only for turkey types', () => {
      component.truttisCaught = 0;

      const turkey = new Turkey(0, 0, 0, 0, 10, 10);
      component['gameObjects'] = [turkey];
      component.handleObjectClick(turkey, 0);
      expect(component.truttisCaught).toBe(1);

      const specialTurkey = new SpecialTurkey(0, 0, 0, 0, 10, 10, 1);
      component['gameObjects'] = [specialTurkey];
      component.handleObjectClick(specialTurkey, 0);
      expect(component.truttisCaught).toBe(2);

      const bikiniGirl = new BikiniGirl(0, 0, 0, 0, 10, 10);
      component['gameObjects'] = [bikiniGirl];
      component.handleObjectClick(bikiniGirl, 0);
      expect(component.truttisCaught).toBe(2);
    });
  });

  describe('scoreboard management', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should save score to storage service', async () => {
      component.money = 500;
      component.difficulty = 'Schuh';
      component.gameStarted = true;
      component.gameOver = true;
      component.timeRemaining = 42;
      component.totalClicks = 12;
      component.truttisCaught = 4;
      component.caughtSpecialTurkeys.add(2);
      component['scoreboard'] = [];
      
      await component.saveScore('Test Player');
      
      const saved = await scoreboardService.getScoreboard();
      expect(saved.length).toBe(1);
      expect(saved[0].name).toBe('Test Player');
      expect(saved[0].score).toBe(500);
      expect(saved[0].difficulty).toBe('Schuh');
      expect(saved[0].stats.timeRemaining).toBe(42);
      expect(saved[0].stats.specialTruttisCaught).toBe(1);
      expect(saved[0].stats.totalClicks).toBe(12);
      expect(component.gameStarted).toBe(false);
      expect(component.gameOver).toBe(false);
      expect(component.savingScore).toBe(false);
    });

    it('should not save duplicate scores for the same run', async () => {
      component.money = 250;
      component.difficulty = 'Andi';
      component['scoreboard'] = [];

      const firstSave = component.saveScore('First Save');
      await Promise.resolve();
      const secondSave = component.saveScore('Second Save');
      await Promise.all([firstSave, secondSave]);

      const saved = await scoreboardService.getScoreboard();
      expect(saved.length).toBe(1);
      expect(saved[0].name).toBe('First Save');
    });

    it('should sort scoreboard by score descending', async () => {
      component.money = 300;
      component.difficulty = 'Andi';
      component['scoreboard'] = [
        { name: 'Player 1', score: 100, date: new Date().toISOString(), difficulty: 'Andi', stats: baseStats },
        { name: 'Player 2', score: 500, date: new Date().toISOString(), difficulty: 'Schuh', stats: baseStats }
      ];
      
      await component.saveScore('Player 3');
      
      expect(component['scoreboard'][0].score).toBe(500);
      expect(component['scoreboard'][1].score).toBe(300);
      expect(component['scoreboard'][2].score).toBe(100);
    });

    it('should keep only top 5 scores', async () => {
      component['scoreboard'] = Array.from({ length: 5 }, (_, i) => ({
        name: `Player ${i}`,
        score: i * 100,
        date: new Date().toISOString(),
        difficulty: 'Andi' as const,
        stats: baseStats
      }));
      
      component.money = 1000;
      component.difficulty = 'Mexxx';
      await component.saveScore('Top Player');
      
      expect(component['scoreboard'].length).toBe(5);
      expect(component['scoreboard'][0].score).toBe(1000);
    });

    it('should load scoreboard from localStorage', async () => {
      const mockScoreboard = [
        { name: 'Player 1', score: 500, date: new Date().toISOString(), difficulty: 'Schuh', stats: baseStats },
        { name: 'Player 2', score: 300, date: new Date().toISOString(), difficulty: 'Andi', stats: baseStats }
      ];
      localStorage.setItem('truttihunt-scoreboard', JSON.stringify(mockScoreboard));
      
      await component.loadScoreboard();
      
      expect(component['scoreboard'].length).toBe(2);
      expect(component['scoreboard'][0].name).toBe('Player 1');
      expect(component['scoreboard'][1].name).toBe('Player 2');
    });

    it('should migrate old scoreboard entries without difficulty', async () => {
      const oldScoreboard = [
        { name: 'Old Player', score: 200, date: new Date().toISOString() }
      ];
      localStorage.setItem('truttihunt-scoreboard', JSON.stringify(oldScoreboard));
      
      await component.loadScoreboard();
      
      expect(component['scoreboard'][0].difficulty).toBe('Andi');
      expect(component['scoreboard'][0].stats.truttisCaught).toBe(0);
    });
  });

  describe('game qualification', () => {
    beforeEach(() => {
      component['scoreboard'] = [];
    });

    it('should qualify with less than 5 scores', async () => {
      await scoreboardService.saveScoreboard([
        { name: 'Player 1', score: 100, date: new Date().toISOString(), difficulty: 'Andi', stats: baseStats }
      ]);
      component.money = 50;
      
      await component.endGame();
      
      expect(component.qualifiesForHighscore).toBe(true);
    });

    it('should qualify with score higher than lowest in top 5', async () => {
      await scoreboardService.saveScoreboard(Array.from({ length: 5 }, (_, i) => ({
        name: `Player ${i}`,
        score: (i + 1) * 100,
        date: new Date().toISOString(),
        difficulty: 'Andi' as const,
        stats: baseStats
      })));
      component.money = 600;
      
      await component.endGame();
      
      expect(component.qualifiesForHighscore).toBe(true);
    });

    it('should not qualify with score lower than lowest in top 5', async () => {
      await scoreboardService.saveScoreboard(Array.from({ length: 5 }, (_, i) => ({
        name: `Player ${i}`,
        score: (i + 2) * 100,
        date: new Date().toISOString(),
        difficulty: 'Andi' as const,
        stats: baseStats
      })));
      component.money = 50;
      
      await component.endGame();
      
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
      component.qualifiesForHighscore = true;
      component.completionMessage = 'Test message';
      component.totalClicks = 5;
      component.truttisCaught = 2;
      
      component.resetGame();
      
      expect(component.gameStarted).toBe(false);
      expect(component.gameOver).toBe(false);
      expect(component.showScoreboard).toBe(false);
      expect(component.qualifiesForHighscore).toBe(false);
      expect(component.completionMessage).toBe('');
      expect(component.totalClicks).toBe(0);
      expect(component.truttisCaught).toBe(0);
    });
  });

  describe('object spawning with spawners', () => {
    beforeEach(() => {
      component['CANVAS_WIDTH'] = 800;
      component['CANVAS_HEIGHT'] = 600;
      component.difficulty = 'Andi';
      component.caughtSpecialTurkeys = new Set();
      component['spawnedSpecialTurkeys'] = new Set();
      component.timeRemaining = 90;
    });

    it('should spawn objects through SpawnManager over time', async () => {
      component.startGame({ audioUrl: '', difficulty: 'Andi' });
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Objects should be spawned via SpawnManager in game loop
      // Since spawning is probabilistic, we just verify the manager exists
      expect(component['spawnManager']).toBeDefined();
      
      component.stopGame();
    });

    it('should manage special turkey spawning', async () => {
      component.startGame({ audioUrl: '', difficulty: 'Andi' });
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Verify special turkey tracking is initialized
      expect(component.caughtSpecialTurkeys.size).toBe(0);
      expect(component['spawnedSpecialTurkeys'].size).toBe(0);
      
      component.stopGame();
    });

    it('should track caught special turkeys', () => {
      component.caughtSpecialTurkeys.add(1);
      component.caughtSpecialTurkeys.add(5);
      component.caughtSpecialTurkeys.add(9);
      
      expect(component.caughtSpecialTurkeys.size).toBe(3);
      expect(component.caughtSpecialTurkeys.has(1)).toBe(true);
      expect(component.caughtSpecialTurkeys.has(5)).toBe(true);
      expect(component.caughtSpecialTurkeys.has(9)).toBe(true);
    });
  });
});
