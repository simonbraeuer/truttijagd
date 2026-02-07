import { Turkey } from './turkey';
import { ISpawner, SpawnContext, SpawnResult } from '../spawner.interface';

export class TurkeySpawner implements ISpawner {
  private readonly SPAWN_INTERVAL = 2000; // 2 seconds
  private readonly SPAWN_CHANCE = 0.5; // 50% chance when interval is met

  trySpawn(context: SpawnContext, lastSpawnTime: number): SpawnResult {
    const timeSinceLastSpawn = context.gameTime - lastSpawnTime;
    
    if (timeSinceLastSpawn < this.SPAWN_INTERVAL) {
      return { shouldSpawn: false };
    }

    const rand = Math.random();
    if (rand >= this.SPAWN_CHANCE) {
      return { shouldSpawn: false };
    }

    const { x, y, vx, vy, width, height } = this.getSpawnParameters(context);
    const turkey = new Turkey(x, y, vx, vy, width, height);

    return {
      shouldSpawn: true,
      gameObject: turkey
    };
  }

  private getSpawnParameters(context: SpawnContext) {
    const { canvasWidth, canvasHeight, difficulty } = context;
    const { width, height, speedMultiplier } = this.getObjectSize(context);

    // Spawn from left or right side
    const x = Math.random() < 0.5 ? -50 : canvasWidth + 50;
    const y = Math.random() * (canvasHeight - 100);
    
    // Objects on left side move right (positive vx), objects on right side move left (negative vx)
    const vxDirection = x < 0 ? 1 : -1;
    const vx = vxDirection * (2 + Math.random() * 2) * speedMultiplier;
    const vy = (Math.random() - 0.5) * 2 * speedMultiplier;

    return { x, y, vx, vy, width, height };
  }

  private getObjectSize(context: SpawnContext): { width: number; height: number; speedMultiplier: number } {
    const MIN_WIDTH = 40;
    const MIN_HEIGHT = 40;
    let widthRatio: number, heightRatio: number, speedMultiplier: number;
    
    switch (context.difficulty) {
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
      width: Math.max(MIN_WIDTH, Math.floor(context.canvasWidth * widthRatio)),
      height: Math.max(MIN_HEIGHT, Math.floor(context.canvasHeight * heightRatio)),
      speedMultiplier
    };
  }
}
