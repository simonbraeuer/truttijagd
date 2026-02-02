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

interface GameObject {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  type: 'turkey' | 'special-turkey' | 'bikini-girl';
  specialId?: number;
  inDelicateSituation?: boolean;
}

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
  private gameTimer: any;
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
    
    // Maintain aspect ratio 4:3
    const aspectRatio = 4 / 3;
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
      
      // Start game timer (countdown from 90 seconds)
      this.gameTimer = setInterval(() => {
        if (!this.paused) {
          this.timeRemaining--;
          this.cdr.detectChanges();
          if (this.timeRemaining <= 0) {
            this.endGame();
          }
        }
      }, 1000);
      
      // Start game loop
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
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
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
    } else if (rand < 0.6) {
      // 60% regular turkey
      type = 'turkey';
    } else if (rand < 0.75) {
      // 15% special turkey
      type = 'special-turkey';
      // Pick a random special turkey that hasn't been spawned yet (or was caught)
      const availableSpecials = this.SPECIAL_TURKEYS.filter(id => 
        !this.spawnedSpecialTurkeys.has(id) || this.caughtSpecialTurkeys.has(id)
      );
      if (availableSpecials.length > 0) {
        specialId = availableSpecials[Math.floor(Math.random() * availableSpecials.length)];
        // Track if this is the last special turkey
        if (this.SPECIAL_TURKEYS.filter(id => !this.caughtSpecialTurkeys.has(id)).length === 1) {
          this.lastSpecialTurkeyId = specialId;
        }
      } else {
        // All have been spawned and not caught yet, pick from uncaught
        const uncaught = this.SPECIAL_TURKEYS.filter(id => !this.caughtSpecialTurkeys.has(id));
        if (uncaught.length > 0) {
          specialId = uncaught[Math.floor(Math.random() * uncaught.length)];
        } else {
          // All caught, pick any
          specialId = this.SPECIAL_TURKEYS[Math.floor(Math.random() * this.SPECIAL_TURKEYS.length)];
        }
      }
      if (specialId) {
        this.spawnedSpecialTurkeys.add(specialId);
      }
    } else {
      // 25% bikini girl
      type = 'bikini-girl';
      // 20% chance of delicate situation with a special turkey
      if (Math.random() < 0.2) {
        inDelicateSituation = true;
      }
    }
    
    // Calculate size and speed based on difficulty with screen-relative sizing
    let widthRatio: number, heightRatio: number, speedMultiplier: number;
    const MIN_WIDTH = 40;
    const MIN_HEIGHT = 40;
    
    switch (this.difficulty) {
      case 'Andi':
        // Bigger size, normal speed (9% of canvas width/height)
        widthRatio = 0.09;
        heightRatio = 0.09;
        speedMultiplier = 1;
        break;
      case 'Schuh':
        // Thinner, faster (6% width, 8% height)
        widthRatio = 0.06;
        heightRatio = 0.08;
        speedMultiplier = 1.5;
        break;
      case 'Mexxx':
        // Smaller size, faster speed (5.5% of canvas)
        widthRatio = 0.055;
        heightRatio = 0.055;
        speedMultiplier = 2;
        break;
    }
    
    const width = Math.max(MIN_WIDTH, Math.floor(this.CANVAS_WIDTH * widthRatio));
    const height = Math.max(MIN_HEIGHT, Math.floor(this.CANVAS_HEIGHT * heightRatio));
    
    const obj: GameObject = {
      x: Math.random() < 0.5 ? -50 : this.CANVAS_WIDTH + 50,
      y: Math.random() * (this.CANVAS_HEIGHT - 100),
      vx: (Math.random() < 0.5 ? 1 : -1) * (2 + Math.random() * 2) * speedMultiplier,
      vy: (Math.random() - 0.5) * 2 * speedMultiplier,
      width,
      height,
      type,
      specialId,
      inDelicateSituation
    };
    
    this.gameObjects.push(obj);
  }

  gameLoop() {
    if (!this.gameStarted || this.gameOver) return;
    
    if (!this.paused) {
      this.updateGameObjects();
      this.render();
    }
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  updateGameObjects() {
    // Update positions
    this.gameObjects.forEach(obj => {
      obj.x += obj.vx;
      obj.y += obj.vy;
      
      // Bounce off top/bottom
      if (obj.y < 0 || obj.y > this.CANVAS_HEIGHT - obj.height) {
        obj.vy *= -1;
      }
      
      // On Mexxx difficulty, add random bouncing for turkeys
      if (this.difficulty === 'Mexxx' && (obj.type === 'turkey' || obj.type === 'special-turkey')) {
        // Random chance to bounce (5% per frame)
        if (Math.random() < 0.05) {
          obj.vy *= -1;
          // Add some randomness to the bounce angle
          obj.vy += (Math.random() - 0.5) * 2;
        }
      }
    });
    
    // Check if last special turkey is leaving screen
    const offScreenObjects = this.gameObjects.filter(obj => 
      obj.x <= -100 || obj.x >= this.CANVAS_WIDTH + 100
    );
    
    offScreenObjects.forEach(obj => {
      if (obj.type === 'special-turkey' && obj.specialId === this.lastSpecialTurkeyId) {
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
    
    // Draw game objects
    this.gameObjects.forEach(obj => {
      this.drawObject(obj);
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

  drawObject(obj: GameObject) {
    this.ctx.save();
    this.ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
    
    if (obj.type === 'turkey' || obj.type === 'special-turkey') {
      this.drawTurkey(obj);
    } else if (obj.type === 'bikini-girl') {
      this.drawBikiniGirl(obj);
    }
    
    this.ctx.restore();
  }

  drawTurkey(obj: GameObject) {
    // Turkey body
    this.ctx.fillStyle = obj.type === 'special-turkey' ? '#FFD700' : '#8B4513';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 25, 20, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Turkey head
    this.ctx.fillStyle = obj.type === 'special-turkey' ? '#FFA500' : '#A0522D';
    this.ctx.beginPath();
    this.ctx.arc(-15, -10, 12, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Eye
    this.ctx.fillStyle = 'black';
    this.ctx.beginPath();
    this.ctx.arc(-18, -12, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Beak
    this.ctx.fillStyle = '#FFA500';
    this.ctx.beginPath();
    this.ctx.moveTo(-20, -8);
    this.ctx.lineTo(-28, -8);
    this.ctx.lineTo(-24, -5);
    this.ctx.fill();
    
    // Tail feathers
    const colors = obj.type === 'special-turkey' ? 
      ['#FFD700', '#FF6347', '#FF1493', '#00CED1', '#32CD32'] :
      ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F4A460'];
    
    for (let i = 0; i < 5; i++) {
      this.ctx.fillStyle = colors[i];
      this.ctx.beginPath();
      const angle = (i - 2) * 0.3;
      this.ctx.moveTo(20, 0);
      this.ctx.lineTo(30 + Math.cos(angle) * 15, Math.sin(angle) * 15);
      this.ctx.lineTo(25 + Math.cos(angle) * 10, Math.sin(angle) * 10);
      this.ctx.fill();
    }
    
    // Special turkey badge
    if (obj.type === 'special-turkey' && obj.specialId) {
      this.ctx.fillStyle = 'red';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(obj.specialId.toString(), 0, 5);
    }
  }

  drawBikiniGirl(obj: GameObject) {
    // Body
    this.ctx.fillStyle = '#FFE4C4';
    this.ctx.fillRect(-10, -15, 20, 30);
    
    // Head
    this.ctx.beginPath();
    this.ctx.arc(0, -25, 10, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Hair
    this.ctx.fillStyle = '#8B4513';
    this.ctx.beginPath();
    this.ctx.arc(0, -30, 12, 0, Math.PI);
    this.ctx.fill();
    
    // Bikini top
    this.ctx.fillStyle = '#FF69B4';
    this.ctx.fillRect(-10, -10, 20, 8);
    
    // Bikini bottom
    this.ctx.fillRect(-10, 8, 20, 7);
    
    // Arms
    this.ctx.strokeStyle = '#FFE4C4';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(-10, -5);
    this.ctx.lineTo(-20, 0);
    this.ctx.moveTo(10, -5);
    this.ctx.lineTo(20, 0);
    this.ctx.stroke();
    
    // Legs
    this.ctx.beginPath();
    this.ctx.moveTo(-5, 15);
    this.ctx.lineTo(-7, 25);
    this.ctx.moveTo(5, 15);
    this.ctx.lineTo(7, 25);
    this.ctx.stroke();
    
    // Delicate situation indicator
    if (obj.inDelicateSituation) {
      this.ctx.fillStyle = 'red';
      this.ctx.font = 'bold 20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('💕', 15, -20);
    }
  }

  onCanvasClick(event: MouseEvent) {
    if (!this.gameStarted || this.gameOver || this.paused) return;
    
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
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
    if (obj.type === 'turkey') {
      // Regular turkey: +10 money
      this.money += 10;
      this.gameObjects.splice(index, 1);
    } else if (obj.type === 'special-turkey') {
      // Special turkey: +50 money
      this.money += 50;
      if (obj.specialId) {
        this.caughtSpecialTurkeys.add(obj.specialId);
      }
      this.gameObjects.splice(index, 1);
      
      // Check if all special turkeys caught
      if (this.caughtSpecialTurkeys.size === 9) {
        this.money += 500; // Bonus for catching all
        this.completionMessage = '🎉 All 9 Truttis caught! +$500 bonus! 🎉';
        setTimeout(() => {
          this.endGame();
        }, 2000);
      } else if (obj.specialId === this.lastSpecialTurkeyId) {
        // Last special turkey was caught
        setTimeout(() => {
          this.endGame();
        }, 1000);
      }
    } else if (obj.type === 'bikini-girl') {
      if (obj.inDelicateSituation) {
        // Bonus situation: +100 money
        this.money += 100;
        this.gameObjects.splice(index, 1);
      } else {
        // Penalty: -50 money
        this.money -= 50;
        this.gameObjects.splice(index, 1);
      }
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
