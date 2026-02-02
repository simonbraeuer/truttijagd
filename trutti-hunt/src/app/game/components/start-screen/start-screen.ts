import { Component, EventEmitter, Output, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { ScoreEntry } from '../scoreboard/scoreboard';

export type DifficultyLevel = 'Andi' | 'Schuh' | 'Mexxx';

export interface GameSettings {
  audioUrl: string;
  difficulty: DifficultyLevel;
}

@Component({
  selector: 'app-start-screen',
  imports: [CommonModule, FormsModule],
  templateUrl: './start-screen.html',
  styleUrl: './start-screen.css'
})
export class StartScreenComponent implements OnInit {
  @Output() startGame = new EventEmitter<GameSettings>();
  @Output() difficultyChange = new EventEmitter<DifficultyLevel>();
  
  audioUrl: string = '';
  isLargeScreen: boolean = false;
  difficulty: DifficultyLevel = 'Andi';
  difficultyValue: number = 0; // 0 = Andi, 1 = Schuh, 2 = Mexxx
  scoreboard: ScoreEntry[] = [];

  ngOnInit() {
    // Load saved audio URL from localStorage
    const savedAudioUrl = localStorage.getItem('truttihunt-audio-url');
    if (savedAudioUrl) {
      this.audioUrl = savedAudioUrl;
    }
    
    // Load saved difficulty from localStorage
    const savedDifficulty = localStorage.getItem('truttihunt-difficulty') as DifficultyLevel;
    if (savedDifficulty) {
      this.difficulty = savedDifficulty;
      this.difficultyValue = this.getDifficultyValue(savedDifficulty);
    }
    
    // Load scoreboard from localStorage
    this.loadScoreboard();
    
    // Check screen size
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    // Only open accordions if there's sufficient space
    // Require more height (800px) to ensure accordions fit comfortably when open
    this.isLargeScreen = window.innerWidth >= 768 && window.innerHeight >= 800;
  }

  getDifficultyValue(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'Andi': return 0;
      case 'Schuh': return 1;
      case 'Mexxx': return 2;
    }
  }

  getDifficultyFromValue(value: number): DifficultyLevel {
    switch (value) {
      case 0: return 'Andi';
      case 1: return 'Schuh';
      case 2: return 'Mexxx';
      default: return 'Andi';
    }
  }

  onDifficultyChange() {
    this.difficulty = this.getDifficultyFromValue(this.difficultyValue);
    this.difficultyChange.emit(this.difficulty);
  }

  getDifficultyIcon(difficulty: DifficultyLevel): string {
    switch (difficulty) {
      case 'Andi':
        return '🐔';
      case 'Schuh':
        return '🦃';
      case 'Mexxx':
        return '🔥';
      default:
        return '🐔';
    }
  }

  loadScoreboard() {
    const savedScoreboard = localStorage.getItem('truttihunt-scoreboard');
    if (savedScoreboard) {
      try {
        const loaded = JSON.parse(savedScoreboard);
        // Migrate old entries without difficulty field
        this.scoreboard = loaded.map((entry: any) => ({
          ...entry,
          difficulty: entry.difficulty || 'Andi'
        }));
      } catch (e) {
        this.scoreboard = [];
      }
    } else {
      this.scoreboard = [];
    }
  }

  onStartGame() {
    // Save audio URL to localStorage
    if (this.audioUrl.trim()) {
      localStorage.setItem('truttihunt-audio-url', this.audioUrl.trim());
    } else {
      localStorage.removeItem('truttihunt-audio-url');
    }
    
    // Save difficulty to localStorage
    localStorage.setItem('truttihunt-difficulty', this.difficulty);
    
    this.startGame.emit({
      audioUrl: this.audioUrl,
      difficulty: this.difficulty
    });
  }
}
