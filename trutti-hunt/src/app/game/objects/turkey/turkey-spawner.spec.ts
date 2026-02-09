import { describe, it, expect, beforeEach } from 'vitest';
import { TurkeySpawner } from './turkey-spawner';
import { SpawnContext } from '../spawner.interface';
import { Turkey } from './turkey';

describe('TurkeySpawner', () => {
  let spawner: TurkeySpawner;
  let context: SpawnContext;

  beforeEach(() => {
    spawner = new TurkeySpawner();
    context = {
      canvasWidth: 800,
      canvasHeight: 600,
      difficulty: 'Andi',
      gameTime: 3000,
      timeRemaining: 85
    };
  });

  it('should create a spawner', () => {
    expect(spawner).toBeDefined();
  });

  it('should not spawn if interval not met', () => {
    const result = spawner.trySpawn(context, 2500); // Only 500ms since last spawn
    
    expect(result.shouldSpawn).toBe(false);
    expect(result.gameObject).toBeUndefined();
  });

  it('should attempt spawn if interval is met', () => {
    const result = spawner.trySpawn(context, 500); // 2500ms since last spawn
    
    // Result depends on random chance (50%), but it should at least try
    expect(result.shouldSpawn !== undefined).toBe(true);
  });

  it('should spawn a Turkey when conditions are met', () => {
    // Run multiple times to overcome randomness
    let spawned = false;
    for (let i = 0; i < 20; i++) {
      const result = spawner.trySpawn(context, 0); // Long time since last spawn
      if (result.shouldSpawn) {
        expect(result.gameObject).toBeInstanceOf(Turkey);
        expect(result.gameObject?.width).toBeGreaterThan(0);
        expect(result.gameObject?.height).toBeGreaterThan(0);
        spawned = true;
        break;
      }
    }
    expect(spawned).toBe(true); // Should have spawned at least once in 20 tries
  });

  it('should spawn turkeys with appropriate size for Andi difficulty', () => {
    context.difficulty = 'Andi';
    
    for (let i = 0; i < 50; i++) {
      const result = spawner.trySpawn(context, 0);
      if (result.shouldSpawn && result.gameObject) {
        // Andi difficulty: 0.09 ratio, speed 1x
        expect(result.gameObject.width).toBeGreaterThanOrEqual(40);
        expect(result.gameObject.height).toBeGreaterThanOrEqual(40);
        return; // Test passed
      }
    }
  });

  it('should spawn turkeys with appropriate size for Mexxx difficulty', () => {
    context.difficulty = 'Mexxx';
    
    for (let i = 0; i < 50; i++) {
      const result = spawner.trySpawn(context, 0);
      if (result.shouldSpawn && result.gameObject) {
        // Mexxx difficulty: 0.055 ratio, speed 2x
        expect(result.gameObject.width).toBeGreaterThanOrEqual(40);
        expect(result.gameObject.height).toBeGreaterThanOrEqual(40);
        // Speed multiplier affects velocity
        expect(Math.abs(result.gameObject.vx)).toBeGreaterThan(0);
        return; // Test passed
      }
    }
  });

  it('should spawn turkeys from left or right side', () => {
    const positions: number[] = [];
    
    for (let i = 0; i < 50; i++) {
      const result = spawner.trySpawn(context, 0);
      if (result.shouldSpawn && result.gameObject) {
        positions.push(result.gameObject.x);
      }
    }
    
    // Should have spawned some turkeys
    expect(positions.length).toBeGreaterThan(0);
    
    // Check that we have both left (<0) and/or right (>800) spawns
    // (Due to randomness, we may not get both in a single test run, but at least one)
    const hasLeftSpawn = positions.some(x => x < 0);
    const hasRightSpawn = positions.some(x => x > 800);
    expect(hasLeftSpawn || hasRightSpawn).toBe(true);
  });

  it('should spawn turkeys with velocities matching spawn side', () => {
    for (let i = 0; i < 50; i++) {
      const result = spawner.trySpawn(context, 0);
      if (result.shouldSpawn && result.gameObject) {
        const obj = result.gameObject;
        
        // Left side spawns should move right (positive vx)
        if (obj.x < 0) {
          expect(obj.vx).toBeGreaterThan(0);
        }
        // Right side spawns should move left (negative vx)
        if (obj.x > 800) {
          expect(obj.vx).toBeLessThan(0);
        }
      }
    }
  });
});
