import { Component, EventEmitter, Output, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-start-screen',
  imports: [CommonModule, FormsModule],
  templateUrl: './start-screen.html',
  styleUrl: './start-screen.css'
})
export class StartScreenComponent implements OnInit {
  @Output() startGame = new EventEmitter<string>();
  
  audioUrl: string = '';
  isLargeScreen: boolean = false;

  ngOnInit() {
    // Load saved audio URL from localStorage
    const savedAudioUrl = localStorage.getItem('truttihunt-audio-url');
    if (savedAudioUrl) {
      this.audioUrl = savedAudioUrl;
    }
    
    // Check screen size
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isLargeScreen = window.innerWidth >= 768 && window.innerHeight >= 700;
  }

  onStartGame() {
    // Save audio URL to localStorage
    if (this.audioUrl.trim()) {
      localStorage.setItem('truttihunt-audio-url', this.audioUrl.trim());
    } else {
      localStorage.removeItem('truttihunt-audio-url');
    }
    
    this.startGame.emit(this.audioUrl);
  }
}
