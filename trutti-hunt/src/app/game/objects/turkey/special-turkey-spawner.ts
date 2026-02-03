import { SpecialTurkey } from './turkey';
import { ISpawner, SpawnContext, SpawnResult } from '../spawner.interface';

export interface SpecialTurkeySpawnerConfig {
  caughtSpecialTurkeys: Set<number>;
  spawnedSpecialTurkeys: Set<number>;
  lastSpecialTurkeyId: number | null;
  allSpecialIds: readonly number[];
}

export class SpecialTurkeySpawner implements ISpawner {
  private readonly SPAWN_INTERVAL = 2000; // 2 seconds
  private readonly SPAWN_CHANCE = 0.3; // 30% chance (was 30% in original code)
  private readonly FORCED_SPAWN_TIME_THRESHOLD = 0.3; // Force spawn when < 30% time remains

  constructor(private config: SpecialTurkeySpawnerConfig) {}

  trySpawn(context: SpawnContext, lastSpawnTime: number): SpawnResult {
    const timeSinceLastSpawn = context.gameTime - lastSpawnTime;
    
    if (timeSinceLastSpawn < this.SPAWN_INTERVAL) {
      return { shouldSpawn: false };
    }

    // Check if we need to force spawn due to time running out
    const unspawnedSpecials = this.getUnspawnedSpecials();
    const timePercentRemaining = context.timeRemaining / 90;
    
    let specialId: number | undefined;

    if (unspawnedSpecials.length > 0 && timePercentRemaining < this.FORCED_SPAWN_TIME_THRESHOLD) {
      // Force spawn one of the unspawned specials
      specialId = unspawnedSpecials[Math.floor(Math.random() * unspawnedSpecials.length)];
    } else {
      // Normal spawn chance
      const rand = Math.random();
      if (rand >= this.SPAWN_CHANCE) {
        return { shouldSpawn: false };
      }

      // Pick a special turkey that hasn't been spawned yet AND hasn't been caught
      const availableSpecials = this.config.allSpecialIds.filter(id => 
        !this.config.spawnedSpecialTurkeys.has(id) && !this.config.caughtSpecialTurkeys.has(id)
      );

      if (availableSpecials.length > 0) {
        specialId = availableSpecials[Math.floor(Math.random() * availableSpecials.length)];
      } else {
        // All have been spawned, pick from uncaught
        const uncaught = this.config.allSpecialIds.filter(id => !this.config.caughtSpecialTurkeys.has(id));
        if (uncaught.length > 0) {
          specialId = uncaught[Math.floor(Math.random() * uncaught.length)];
        } else {
          // All caught, don't spawn
          return { shouldSpawn: false };
        }
      }
    }

    if (!specialId) {
      return { shouldSpawn: false };
    }

    // Track spawned special
    this.config.spawnedSpecialTurkeys.add(specialId);

    // Check if this is the last uncaught special turkey
    const remainingUncaught = this.config.allSpecialIds.filter(id => 
      !this.config.caughtSpecialTurkeys.has(id) && id !== specialId
    ).length;
    
    const isLastSpecial = remainingUncaught === 0;

    const { x, y, vx, vy, width, height } = this.getSpawnParameters(context);
    const specialTurkey = new SpecialTurkey(x, y, vx, vy, width, height, specialId, isLastSpecial);

    return {
      shouldSpawn: true,
      gameObject: specialTurkey
    };
  }

  private getUnspawnedSpecials(): number[] {
    return this.config.allSpecialIds.filter(id => !this.config.spawnedSpecialTurkeys.has(id));
  }

  private getSpawnParameters(context: SpawnContext) {
    const { canvasWidth, canvasHeight } = context;
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
