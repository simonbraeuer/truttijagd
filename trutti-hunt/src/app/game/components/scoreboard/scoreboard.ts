import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DifficultyLevel } from '../index';

export interface ScoreEntry {
  name: string;
  score: number;
  date: string;
  difficulty: DifficultyLevel;
  stats: ScoreStats;
}

export interface ScoreStats {
  timeRemaining: number;
  truttisCaught: number;
  specialTruttisCaught: number;
  totalClicks: number;
}

@Component({
  selector: 'app-scoreboard',
  imports: [CommonModule],
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.css'
})
export class ScoreboardComponent {
  @Input() scoreboard: ScoreEntry[] = [];
  @Input() currentPlayerName: string = '';
  @Input() currentScore: number = 0;
  @Output() backToMenu = new EventEmitter<void>();

  onBackToMenu() {
    this.backToMenu.emit();
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
}
