import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-over',
  imports: [CommonModule, FormsModule],
  templateUrl: './game-over.html',
  styleUrl: './game-over.css'
})
export class GameOverComponent {
  @Input() money: number = 0;
  @Input() caughtSpecialTurkeys: number = 0;
  @Output() saveScore = new EventEmitter<string>();
  
  playerName: string = '';

  onSaveScore() {
    if (!this.playerName.trim()) {
      alert('Please enter your name!');
      return;
    }
    this.saveScore.emit(this.playerName.trim());
  }
}
