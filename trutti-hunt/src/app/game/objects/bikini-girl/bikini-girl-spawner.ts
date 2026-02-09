import { BikiniGirl, DelicateBikiniGirl } from './bikini-girl';
import { ISpawner, SpawnContext, SpawnResult } from '../spawner.interface';

export class BikiniGirlSpawner implements ISpawner {
  private readonly SPAWN_INTERVAL = 2000; // 2 seconds
  private readonly SPAWN_CHANCE = 0.2; // 20% chance when interval is met
  private readonly DELICATE_SITUATION_CHANCE = 0.2; // 20% chance of delicate situation

  trySpawn(context: SpawnContext, lastSpawnTime: number): SpawnResult {
    const timeSinceLastSpawn = context.gameTime - lastSpawnTime;
    
    if (timeSinceLastSpawn < this.SPAWN_INTERVAL) {
      return { shouldSpawn: false };
    }

    const rand = Math.random();
    if (rand >= this.SPAWN_CHANCE) {
      return { shouldSpawn: false };
    }

    const inDelicateSituation = Math.random() < this.DELICATE_SITUATION_CHANCE;
    const { x, y, vx, vy, width, height } = this.getSpawnParameters(context, inDelicateSituation);
    const bikiniGirl = inDelicateSituation
      ? new DelicateBikiniGirl(x, y, vx, vy, width, height)
      : new BikiniGirl(x, y, vx, vy, width, height);

    return {
      shouldSpawn: true,
      gameObject: bikiniGirl
    };
  }

  private getSpawnParameters(context: SpawnContext, isDelicate: boolean) {
    const { canvasWidth, canvasHeight } = context;
    const { width, height } = this.getObjectSize(context, isDelicate);

    // Spawn from left or right side
    const x = Math.random() < 0.5 ? -50 : canvasWidth + 50;
    const y = Math.random() * (canvasHeight - 100);
    
    // Objects on left side move right (positive vx), objects on right side move left (negative vx)
    // Base speed - objects will apply their own multiplier based on difficulty
    const vxDirection = x < 0 ? 1 : -1;
    const vx = vxDirection * (2 + Math.random() * 2);
    const vy = (Math.random() - 0.5) * 2;

    return { x, y, vx, vy, width, height };
  }

  private getObjectSize(context: SpawnContext, isDelicate: boolean): { width: number; height: number } {
    const MIN_WIDTH = 40;
    const MIN_HEIGHT = 40;
    let widthRatio: number, heightRatio: number;
    
    switch (context.difficulty) {
      case 'Andi':
        widthRatio = 0.09;
        heightRatio = 0.09;
        break;
      case 'Schuh':
        widthRatio = 0.06;
        heightRatio = 0.08;
        break;
      case 'Mexxx':
        // Delicate bikini girls are bigger obstacles on Mexxx
        widthRatio = isDelicate ? 0.12 : 0.055;
        heightRatio = isDelicate ? 0.12 : 0.055;
        break;
    }
    
    return {
      width: Math.max(MIN_WIDTH, Math.floor(context.canvasWidth * widthRatio)),
      height: Math.max(MIN_HEIGHT, Math.floor(context.canvasHeight * heightRatio))
    };
  }
}
