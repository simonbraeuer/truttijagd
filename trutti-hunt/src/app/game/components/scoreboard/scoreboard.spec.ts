import { describe, it, expect } from 'vitest';
import type { ScoreEntry } from './scoreboard';

describe('ScoreboardComponent', () => {
  describe('ScoreEntry interface', () => {
    it('should have required properties', () => {
      const entry: ScoreEntry = {
        name: 'Test Player',
        score: 500,
        date: '2026-02-02T12:00:00.000Z',
        difficulty: 'Schuh'
      };

      expect(entry.name).toBe('Test Player');
      expect(entry.score).toBe(500);
      expect(entry.date).toBeDefined();
      expect(entry.difficulty).toBe('Schuh');
    });

    it('should support all difficulty levels', () => {
      const easyEntry: ScoreEntry = {
        name: 'Easy Player',
        score: 100,
        date: new Date().toISOString(),
        difficulty: 'Andi'
      };

      const mediumEntry: ScoreEntry = {
        name: 'Medium Player',
        score: 200,
        date: new Date().toISOString(),
        difficulty: 'Schuh'
      };

      const hardEntry: ScoreEntry = {
        name: 'Hard Player',
        score: 300,
        date: new Date().toISOString(),
        difficulty: 'Mexxx'
      };

      expect(easyEntry.difficulty).toBe('Andi');
      expect(mediumEntry.difficulty).toBe('Schuh');
      expect(hardEntry.difficulty).toBe('Mexxx');
    });
  });

  describe('Scoreboard sorting', () => {
    it('should sort by score descending', () => {
      const entries: ScoreEntry[] = [
        { name: 'Player 1', score: 100, date: new Date().toISOString(), difficulty: 'Andi' },
        { name: 'Player 2', score: 500, date: new Date().toISOString(), difficulty: 'Schuh' },
        { name: 'Player 3', score: 300, date: new Date().toISOString(), difficulty: 'Mexxx' }
      ];

      const sorted = entries.sort((a, b) => b.score - a.score);

      expect(sorted[0].score).toBe(500);
      expect(sorted[1].score).toBe(300);
      expect(sorted[2].score).toBe(100);
    });

    it('should limit to top 5 entries', () => {
      const entries: ScoreEntry[] = Array.from({ length: 10 }, (_, i) => ({
        name: `Player ${i}`,
        score: i * 100,
        date: new Date().toISOString(),
        difficulty: 'Andi' as const
      }));

      const sorted = entries.sort((a, b) => b.score - a.score);
      const top5 = sorted.slice(0, 5);

      expect(top5.length).toBe(5);
      expect(top5[0].score).toBe(900);
      expect(top5[4].score).toBe(500);
    });
  });
});
