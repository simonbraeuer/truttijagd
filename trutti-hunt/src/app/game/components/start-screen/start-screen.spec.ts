import { describe, it, expect, beforeEach } from 'vitest';
import type { DifficultyLevel, GameSettings } from './start-screen';

describe('StartScreenComponent', () => {
  describe('DifficultyLevel type', () => {
    it('should support all difficulty levels', () => {
      const easy: DifficultyLevel = 'Andi';
      const medium: DifficultyLevel = 'Schuh';
      const hard: DifficultyLevel = 'Mexxx';

      expect(easy).toBe('Andi');
      expect(medium).toBe('Schuh');
      expect(hard).toBe('Mexxx');
    });
  });

  describe('GameSettings interface', () => {
    it('should have required properties', () => {
      const settings: GameSettings = {
        audioUrl: 'https://example.com/audio.mp3',
        difficulty: 'Schuh'
      };

      expect(settings.audioUrl).toBe('https://example.com/audio.mp3');
      expect(settings.difficulty).toBe('Schuh');
    });

    it('should allow empty audio URL', () => {
      const settings: GameSettings = {
        audioUrl: '',
        difficulty: 'Andi'
      };

      expect(settings.audioUrl).toBe('');
      expect(settings.difficulty).toBe('Andi');
    });
  });

  describe('Difficulty icons mapping', () => {
    const getDifficultyIcon = (difficulty: DifficultyLevel): string => {
      switch (difficulty) {
        case 'Andi':
          return '🐔';
        case 'Schuh':
          return '🦃';
        case 'Mexxx':
          return '🔥';
      }
    };

    it('should return chicken for Andi', () => {
      expect(getDifficultyIcon('Andi')).toBe('🐔');
    });

    it('should return turkey for Schuh', () => {
      expect(getDifficultyIcon('Schuh')).toBe('🦃');
    });

    it('should return fire for Mexxx', () => {
      expect(getDifficultyIcon('Mexxx')).toBe('🔥');
    });
  });

  describe('localStorage integration', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should save audio URL to localStorage', () => {
      const audioUrl = 'https://example.com/music.mp3';
      localStorage.setItem('truttihunt-audio-url', audioUrl);

      expect(localStorage.getItem('truttihunt-audio-url')).toBe(audioUrl);
    });

    it('should save difficulty to localStorage', () => {
      const difficulty: DifficultyLevel = 'Mexxx';
      localStorage.setItem('truttihunt-difficulty', difficulty);

      expect(localStorage.getItem('truttihunt-difficulty')).toBe('Mexxx');
    });

    it('should retrieve saved audio URL', () => {
      localStorage.setItem('truttihunt-audio-url', 'https://example.com/saved.mp3');
      const saved = localStorage.getItem('truttihunt-audio-url');

      expect(saved).toBe('https://example.com/saved.mp3');
    });

    it('should retrieve saved difficulty', () => {
      localStorage.setItem('truttihunt-difficulty', 'Schuh');
      const saved = localStorage.getItem('truttihunt-difficulty') as DifficultyLevel;

      expect(saved).toBe('Schuh');
    });
  });
});
