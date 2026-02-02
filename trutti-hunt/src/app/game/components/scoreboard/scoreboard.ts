import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ScoreEntry {
  name: string;
  score: number;
  date: string;
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
}
