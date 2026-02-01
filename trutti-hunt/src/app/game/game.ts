import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
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
  
  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 600;
  private readonly SPAWN_INTERVAL = 2000;
  private spawnTimer: any;
  
  // Special turkeys IDs (1-9)
  private readonly SPECIAL_TURKEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  caughtSpecialTurkeys: Set<number> = new Set();

  ngOnInit() {
    // Initialize audio
    this.audio = new Audio();
    this.audio.src = 'assets/audio/freed-from-desire.mp3';
    this.audio.loop = true;
    this.audio.volume = 0.5;
  }

  ngOnDestroy() {
    this.stopGame();
  }

  startGame() {
    this.gameStarted = true;
    this.gameOver = false;
    this.money = 0;
    this.gameObjects = [];
    this.caughtSpecialTurkeys.clear();
    
    // Wait for canvas to be available in the DOM
    setTimeout(() => {
      // Initialize canvas context
      if (!this.ctx && this.canvasRef) {
        const canvas = this.canvasRef.nativeElement;
        this.ctx = canvas.getContext('2d')!;
        canvas.width = this.CANVAS_WIDTH;
        canvas.height = this.CANVAS_HEIGHT;
      }
      
      // Start background music
      if (this.audio) {
        this.audio.play().catch(err => console.log('Audio play failed:', err));
      }
      
      // Start spawning objects
      this.spawnTimer = setInterval(() => this.spawnObject(), this.SPAWN_INTERVAL);
      
      // Start game loop
      this.gameLoop();
    }, 0);
  }

  stopGame() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.spawnTimer) {
      clearInterval(this.spawnTimer);
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
    
    if (rand < 0.6) {
      // 60% regular turkey
      type = 'turkey';
    } else if (rand < 0.75) {
      // 15% special turkey
      type = 'special-turkey';
      // Pick a random special turkey that hasn't been caught yet
      const availableSpecials = this.SPECIAL_TURKEYS.filter(id => !this.caughtSpecialTurkeys.has(id));
      if (availableSpecials.length > 0) {
        specialId = availableSpecials[Math.floor(Math.random() * availableSpecials.length)];
      } else {
        // All caught, pick any
        specialId = this.SPECIAL_TURKEYS[Math.floor(Math.random() * this.SPECIAL_TURKEYS.length)];
      }
    } else {
      // 25% bikini girl
      type = 'bikini-girl';
      // 20% chance of delicate situation with a special turkey
      if (Math.random() < 0.2) {
        inDelicateSituation = true;
      }
    }
    
    const obj: GameObject = {
      x: Math.random() < 0.5 ? -50 : this.CANVAS_WIDTH + 50,
      y: Math.random() * (this.CANVAS_HEIGHT - 100),
      vx: (Math.random() < 0.5 ? 1 : -1) * (2 + Math.random() * 2),
      vy: (Math.random() - 0.5) * 2,
      width: 60,
      height: 60,
      type,
      specialId,
      inDelicateSituation
    };
    
    this.gameObjects.push(obj);
  }

  gameLoop() {
    this.updateGameObjects();
    this.render();
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
    if (!this.gameStarted || this.gameOver) return;
    
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
        alert('Congratulations! You caught all 9 special turkeys! +500 bonus!');
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
}
