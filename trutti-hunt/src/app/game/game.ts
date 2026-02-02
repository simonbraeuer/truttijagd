import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  StartScreenComponent, 
  GameOverComponent, 
  PauseOverlayComponent, 
  ScoreboardComponent 
} from './components';
import type { GameSettings, DifficultyLevel } from './components/start-screen/start-screen';
import type { ScoreEntry } from './components/scoreboard/scoreboard';
import { GameObject, Turkey, SpecialTurkey, BikiniGirl } from './game-objects';

@Component({
  selector: 'app-game',
  imports: [CommonModule, FormsModule, StartScreenComponent, GameOverComponent, PauseOverlayComponent, ScoreboardComponent],
  templateUrl: './game.html',
  styleUrl: './game.css'
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private gameObjects: GameObject[] = [];
  private animationId: number = 0;
  private audio: HTMLAudioElement | null = null;
  
  money: number = 0;
  gameStarted: boolean = false;
  gameOver: boolean = false;
  paused: boolean = false;
  completionMessage: string = '';
  playerName: string = '';
  showScoreboard: boolean = false;
  qualifiesForTop10: boolean = false;
  scoreboard: ScoreEntry[] = [];
  private lastSpecialTurkeyId: number | null = null;
  private audioUrl: string = '';
  difficulty: DifficultyLevel = 'Andi';
  
  private CANVAS_WIDTH = 800;
  private CANVAS_HEIGHT = 600;
  private SPAWN_INTERVAL = 2000;
  private spawnTimer: any;
  private lastTimerUpdate: number = 0;
  timeRemaining: number = 90;
  
  // Special turkeys IDs (1-9)
  private readonly SPECIAL_TURKEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  caughtSpecialTurkeys: Set<number> = new Set();
  private spawnedSpecialTurkeys: Set<number> = new Set();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Load saved difficulty from localStorage for display
    const savedDifficulty = localStorage.getItem('truttihunt-difficulty') as DifficultyLevel;
    if (savedDifficulty) {
      this.difficulty = savedDifficulty;
    }
  }

  ngOnDestroy() {
    this.stopGame();
  }

  getTurkeyIcon(): string {
    switch (this.difficulty) {
      case 'Andi':
        return '🐔'; // Chicken (easy difficulty)
      case 'Schuh':
        return '🦃'; // Turkey (medium difficulty)
      case 'Mexxx':
        return '🔥'; // Fire (hard difficulty)
      default:
        return '🐔';
    }
  }

  onDifficultyChange(difficulty: DifficultyLevel) {
    this.difficulty = difficulty;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Pause key is typically 'Pause' or 'P' key
    if (this.gameStarted && !this.gameOver && (event.key === 'Pause' || event.key === 'p' || event.key === 'P')) {
      event.preventDefault();
      this.togglePause();
    }
    
    // Escape key to end game early
    if (this.gameStarted && !this.gameOver && event.key === 'Escape') {
      event.preventDefault();
      this.endGame();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.gameStarted && this.canvasRef) {
      this.updateCanvasSize();
    }
  }

  private updateCanvasSize() {
    if (!this.canvasRef) return;
    
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    
    if (!container) return;
    
    // Get available space from container
    const containerRect = container.getBoundingClientRect();
    const availableWidth = containerRect.width - 40; // Account for padding/margin
    const availableHeight = containerRect.height - 40;
    
    // Check if smartphone in landscape mode
    const isSmartphone = window.innerWidth <= 900 && 'ontouchstart' in window;
    const isLandscape = window.innerWidth > window.innerHeight;
    
    // Use 16:9 for smartphones in landscape, 4:3 otherwise
    const aspectRatio = (isSmartphone && isLandscape) ? 16 / 9 : 4 / 3;
    let width = availableWidth;
    let height = width / aspectRatio;
    
    if (height > availableHeight) {
      height = availableHeight;
      width = height * aspectRatio;
    }
    
    this.CANVAS_WIDTH = Math.floor(width);
    this.CANVAS_HEIGHT = Math.floor(height);
    
    canvas.width = this.CANVAS_WIDTH;
    canvas.height = this.CANVAS_HEIGHT;
  }

  togglePause() {
    this.paused = !this.paused;
    if (!this.paused) {
      // Resume the game loop
      this.gameLoop();
    }
  }

  startGame(settings: GameSettings) {
    this.audioUrl = settings.audioUrl;
    this.difficulty = settings.difficulty;
    
    // Set spawn interval based on difficulty
    switch (this.difficulty) {
      case 'Andi':
        this.SPAWN_INTERVAL = 2000;
        break;
      case 'Schuh':
        this.SPAWN_INTERVAL = 1200; // Faster spawning
        break;
      case 'Mexxx':
        this.SPAWN_INTERVAL = 2000;
        break;
    }
    
    this.gameStarted = true;
    this.gameOver = false;
    this.paused = false;
    this.money = 0;
    this.gameObjects = [];
    this.caughtSpecialTurkeys.clear();
    this.spawnedSpecialTurkeys.clear();
    this.playerName = '';
    this.showScoreboard = false;
    this.qualifiesForTop10 = false;
    this.lastSpecialTurkeyId = null;
    this.timeRemaining = 90;
    this.lastTimerUpdate = Date.now();
    
    // Wait for canvas to be available in the DOM
    setTimeout(() => {
      // Initialize canvas context - always get fresh context since canvas is recreated
      if (this.canvasRef) {
        const canvas = this.canvasRef.nativeElement;
        this.ctx = canvas.getContext('2d')!;
        this.updateCanvasSize();
      }
      
      // Initialize and start background music with user-provided URL
      if (this.audioUrl.trim()) {
        if (!this.audio) {
          this.audio = new Audio();
          this.audio.loop = true;
          this.audio.volume = 0.5;
        }
        this.audio.src = this.audioUrl.trim();
        this.audio.load();
        this.audio.play().catch(err => {
          console.warn('Background music could not be played:', err.message || err);
          console.info('Please provide a valid audio URL');
        });
      }
      
      // Start spawning objects
      this.spawnTimer = setInterval(() => this.spawnObject(), this.SPAWN_INTERVAL);
      
      // Start game loop (timer logic is now in game loop)
      this.gameLoop();
    }, 0);
  }

  stopGame() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
    if (this.spawnTimer) {
      clearInterval(this.spawnTimer);
      this.spawnTimer = null;
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  spawnObject() {
    const rand = Math.random();
    let type: 'turkey' | 'special-turkey' | 'bikini-girl';
    let specialId: number | undefined;
    let inDelicateSituation = false;
    
    // Check if we need to ensure all special turkeys appear
    const unspawnedSpecials = this.SPECIAL_TURKEYS.filter(id => !this.spawnedSpecialTurkeys.has(id));
    const timePercentRemaining = this.timeRemaining / 90;
    
    // Force spawn unspawned special turkeys if time is running out
    if (unspawnedSpecials.length > 0 && timePercentRemaining < 0.3) {
      type = 'special-turkey';
      specialId = unspawnedSpecials[Math.floor(Math.random() * unspawnedSpecials.length)];
      this.spawnedSpecialTurkeys.add(specialId);
    } else if (rand < 0.5) {
      // 50% regular turkey
      type = 'turkey';
    } else if (rand < 0.8) {
      // 30% special turkey (doubled from 15%)
      type = 'special-turkey';
      // Pick a random special turkey that hasn't been spawned yet AND hasn't been caught
      const availableSpecials = this.SPECIAL_TURKEYS.filter(id => 
        !this.spawnedSpecialTurkeys.has(id) && !this.caughtSpecialTurkeys.has(id)
      );
      if (availableSpecials.length > 0) {
        specialId = availableSpecials[Math.floor(Math.random() * availableSpecials.length)];
        // Track if this is the last uncaught special turkey after spawning this one
        const remainingUncaught = this.SPECIAL_TURKEYS.filter(id => 
          !this.caughtSpecialTurkeys.has(id) && id !== specialId
        ).length;
        if (remainingUncaught === 0) {
          this.lastSpecialTurkeyId = specialId;
        }
      } else {
        // All have been spawned, pick from uncaught that are currently on screen
        const uncaught = this.SPECIAL_TURKEYS.filter(id => !this.caughtSpecialTurkeys.has(id));
        if (uncaught.length > 0) {
          specialId = uncaught[Math.floor(Math.random() * uncaught.length)];
        } else {
          // All caught, spawn a regular turkey instead
          type = 'turkey';
        }
      }
      if (specialId) {
        this.spawnedSpecialTurkeys.add(specialId);
      }
    } else {
      // 20% bikini girl
      type = 'bikini-girl';
      // 20% chance of delicate situation
      if (Math.random() < 0.2) {
        inDelicateSituation = true;
      }
    }
    
    // Calculate size and speed based on difficulty
    const { width, height, speedMultiplier } = this.getObjectSize();
    
    const x = Math.random() < 0.5 ? -50 : this.CANVAS_WIDTH + 50;
    const y = Math.random() * (this.CANVAS_HEIGHT - 100);
    const vx = (Math.random() < 0.5 ? 1 : -1) * (2 + Math.random() * 2) * speedMultiplier;
    const vy = (Math.random() - 0.5) * 2 * speedMultiplier;
    
    // Create appropriate game object
    let obj: GameObject;
    if (type === 'special-turkey' && specialId) {
      const isLastSpecial = specialId === this.lastSpecialTurkeyId;
      obj = new SpecialTurkey(x, y, vx, vy, width, height, specialId, isLastSpecial);
    } else if (type === 'bikini-girl') {
      obj = new BikiniGirl(x, y, vx, vy, width, height, inDelicateSituation);
    } else {
      obj = new Turkey(x, y, vx, vy, width, height);
    }
    
    this.gameObjects.push(obj);
  }

  private getObjectSize(): { width: number; height: number; speedMultiplier: number } {
    const MIN_WIDTH = 40;
    const MIN_HEIGHT = 40;
    let widthRatio: number, heightRatio: number, speedMultiplier: number;
    
    switch (this.difficulty) {
      case 'Andi':
        widthRatio = 0.09;
        heightRatio = 0.09;
        speedMultiplier = 1;
        break;
      case 'Schuh':
        widthRatio = 0.06;
        heightRatio = 0.08;
        speedMultiplier = 1.5;
        break;
      case 'Mexxx':
        widthRatio = 0.055;
        heightRatio = 0.055;
        speedMultiplier = 2;
        break;
    }
    
    return {
      width: Math.max(MIN_WIDTH, Math.floor(this.CANVAS_WIDTH * widthRatio)),
      height: Math.max(MIN_HEIGHT, Math.floor(this.CANVAS_HEIGHT * heightRatio)),
      speedMultiplier
    };
  }

  gameLoop() {
    if (!this.gameStarted || this.gameOver) return;
    
    if (!this.paused) {
      // Update timer (check every frame, decrement every second)
      const now = Date.now();
      if (now - this.lastTimerUpdate >= 1000) {
        this.timeRemaining--;
        this.lastTimerUpdate = now;
        this.cdr.detectChanges(); // Trigger change detection for HUD update
        if (this.timeRemaining <= 0) {
          this.endGame();
          return;
        }
      }
      
      this.updateGameObjects();
      this.render();
    }
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  updateGameObjects() {
    // Update positions using object's own update method
    this.gameObjects.forEach(obj => {
      obj.update(this.CANVAS_WIDTH, this.CANVAS_HEIGHT, this.difficulty);
    });
    
    // Check if last special turkey is leaving screen
    const offScreenObjects = this.gameObjects.filter(obj => 
      obj.x <= -100 || obj.x >= this.CANVAS_WIDTH + 100
    );
    
    offScreenObjects.forEach(obj => {
      if (obj instanceof SpecialTurkey && obj.specialId === this.lastSpecialTurkeyId) {
        this.endGame();
      }
    });
    
    // Remove off-screen objects
    this.gameObjects = this.gameObjects.filter(obj => 
      obj.x > -100 && obj.x < this.CANVAS_WIDTH + 100
    );
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    
    // Draw clouds
    this.drawClouds();
    
    // Draw game objects using their own draw methods
    this.gameObjects.forEach(obj => {
      obj.draw(this.ctx);
    });
  }

  drawClouds() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 5; i++) {
      const x = (Date.now() / 50 + i * 200) % (this.CANVAS_WIDTH + 100) - 50;
      const y = 50 + i * 80;
      this.drawCloud(x, y);
    }
  }

  drawCloud(x: number, y: number) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, 20, 0, Math.PI * 2);
    this.ctx.arc(x + 20, y, 25, 0, Math.PI * 2);
    this.ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
    this.ctx.fill();
  }

  onCanvasClick(event: MouseEvent | TouchEvent) {
    if (!this.gameStarted || this.gameOver || this.paused) return;
    
    event.preventDefault();
    
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    // Get coordinates from mouse or touch event
    let x: number, y: number;
    if (event instanceof MouseEvent) {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    } else {
      const touch = event.touches[0] || event.changedTouches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    }
    
    // Check if we clicked on any object
    for (let i = this.gameObjects.length - 1; i >= 0; i--) {
      const obj = this.gameObjects[i];
      if (x >= obj.x && x <= obj.x + obj.width &&
          y >= obj.y && y <= obj.y + obj.height) {
        this.handleObjectClick(obj, i);
        break;
      }
    }
    
    // Camera shutter sound effect
    this.playShutterSound();
  }

  handleObjectClick(obj: GameObject, index: number) {
    // Use polymorphism - each object knows how to handle its own click
    const result = obj.onClick(this.caughtSpecialTurkeys);
    
    this.money += result.moneyChange;
    
    if (result.shouldRemove) {
      this.gameObjects.splice(index, 1);
    }
    
    if (result.caughtSpecialId) {
      this.caughtSpecialTurkeys.add(result.caughtSpecialId);
      this.cdr.detectChanges(); // Trigger change detection for Set update
      
      // If this was the last special turkey, clear the flag since it was caught
      if (result.caughtSpecialId === this.lastSpecialTurkeyId) {
        this.lastSpecialTurkeyId = null;
      }
    }
    
    if (result.completionMessage) {
      this.completionMessage = result.completionMessage;
    }
    
    if (result.shouldEndGame) {
      setTimeout(() => {
        this.endGame();
      }, result.endGameDelay || 0);
    }
  }

  playShutterSound() {
    // Simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  endGame() {
    this.gameOver = true;
    this.stopGame();
    this.loadScoreboard();
    
    // Check if score qualifies for top 5
    if (this.scoreboard.length < 5) {
      // Less than 5 scores, always qualifies
      this.qualifiesForTop10 = true;
    } else {
      // Check if current score beats the lowest score in top 5
      const lowestScore = this.scoreboard[this.scoreboard.length - 1].score;
      this.qualifiesForTop10 = this.money > lowestScore;
    }
    
    // If doesn't qualify, show scoreboard directly
    if (!this.qualifiesForTop10) {
      this.showScoreboard = true;
    }
  }

  saveScore(playerName: string) {
    const score = {
      name: playerName,
      score: this.money,
      date: new Date().toISOString(),
      difficulty: this.difficulty
    };

    this.scoreboard.push(score);
    this.scoreboard.sort((a, b) => b.score - a.score);
    
    // Keep only top 5 scores
    if (this.scoreboard.length > 5) {
      this.scoreboard = this.scoreboard.slice(0, 5);
    }

    localStorage.setItem('truttihunt-scoreboard', JSON.stringify(this.scoreboard));
    this.showScoreboard = true;
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

  resetGame() {
    this.stopGame();
    this.gameStarted = false;
    this.gameOver = false;
    this.showScoreboard = false;
    this.qualifiesForTop10 = false;
    this.completionMessage = '';
    this.gameObjects = [];
  }
}
