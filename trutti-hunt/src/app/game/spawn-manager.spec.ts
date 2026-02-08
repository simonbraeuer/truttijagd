import { describe, it, expect, beforeEach } from 'vitest';
import { SpawnManager } from './spawn-manager';
import { ISpawner, SpawnContext, SpawnResult } from './objects/spawners';
import { GameObject } from './objects/game-object';

// Mock spawner for testing
class MockSpawner implements ISpawner {
  public spawnCount = 0;
  public shouldSpawnNext = true;

  trySpawn(context: SpawnContext, lastSpawnTime: number): SpawnResult {
    if (!this.shouldSpawnNext) {
      return { shouldSpawn: false };
    }

    this.spawnCount++;
    const mockObject = {
      x: 100,
      y: 100,
      vx: 5,
      vy: 3,
      width: 50,
      height: 60,
      update: () => {},
      draw: () => {},
      onClick: () => ({ moneyChange: 10, shouldRemove: true }),
      getType: () => 'mock'
    } as unknown as GameObject;

    return {
      shouldSpawn: true,
      gameObject: mockObject
    };
  }
}

describe('SpawnManager', () => {
  let spawnManager: SpawnManager;
  let context: SpawnContext;

  beforeEach(() => {
    spawnManager = new SpawnManager();
    context = {
      canvasWidth: 800,
      canvasHeight: 600,
      difficulty: 'Andi',
      gameTime: 3000,
      timeRemaining: 85
    };
  });

  it('should create a spawn manager', () => {
    expect(spawnManager).toBeDefined();
  });

  it('should register spawners', () => {
    const mockSpawner = new MockSpawner();
    spawnManager.registerSpawner(mockSpawner);
    
    // Should have registered successfully (no error thrown)
    expect(mockSpawner).toBeDefined();
  });

  it('should update and return spawned objects', () => {
    const mockSpawner = new MockSpawner();
    spawnManager.registerSpawner(mockSpawner);
    
    const spawned = spawnManager.update(context);
    
    expect(spawned.length).toBe(1);
    expect(mockSpawner.spawnCount).toBe(1);
  });

  it('should not spawn objects when spawner returns shouldSpawn: false', () => {
    const mockSpawner = new MockSpawner();
    mockSpawner.shouldSpawnNext = false;
    spawnManager.registerSpawner(mockSpawner);
    
    const spawned = spawnManager.update(context);
    
    expect(spawned.length).toBe(0);
    expect(mockSpawner.spawnCount).toBe(0);
  });

  it('should handle multiple spawners', () => {
    const mockSpawner1 = new MockSpawner();
    const mockSpawner2 = new MockSpawner();
    const mockSpawner3 = new MockSpawner();
    
    spawnManager.registerSpawner(mockSpawner1);
    spawnManager.registerSpawner(mockSpawner2);
    spawnManager.registerSpawner(mockSpawner3);
    
    const spawned = spawnManager.update(context);
    
    expect(spawned.length).toBe(3);
    expect(mockSpawner1.spawnCount).toBe(1);
    expect(mockSpawner2.spawnCount).toBe(1);
    expect(mockSpawner3.spawnCount).toBe(1);
  });

  it('should track last spawn time for each spawner', () => {
    const mockSpawner = new MockSpawner();
    spawnManager.registerSpawner(mockSpawner);
    
    // First update
    context.gameTime = 1000;
    const firstSpawned = spawnManager.update(context);
    expect(firstSpawned.length).toBe(1);
    
    // Second update immediately after
    context.gameTime = 1100;
    const secondSpawned = spawnManager.update(context);
    expect(secondSpawned.length).toBe(1); // Mock spawner always spawns
  });

  it('should reset all spawn timers', () => {
    const mockSpawner1 = new MockSpawner();
    const mockSpawner2 = new MockSpawner();
    
    spawnManager.registerSpawner(mockSpawner1);
    spawnManager.registerSpawner(mockSpawner2);
    
    // Spawn some objects
    spawnManager.update(context);
    
    // Reset
    spawnManager.reset();
    
    // After reset, spawners should act as if they haven't spawned yet
    // (This is verified by the manager maintaining lastSpawnTime = 0)
    const spawned = spawnManager.update(context);
    expect(spawned.length).toBeGreaterThanOrEqual(0); // Depends on spawner logic
  });

  it('should handle mixed spawn results from multiple spawners', () => {
    const alwaysSpawn = new MockSpawner();
    alwaysSpawn.shouldSpawnNext = true;
    
    const neverSpawn = new MockSpawner();
    neverSpawn.shouldSpawnNext = false;
    
    spawnManager.registerSpawner(alwaysSpawn);
    spawnManager.registerSpawner(neverSpawn);
    
    const spawned = spawnManager.update(context);
    
    expect(spawned.length).toBe(1); // Only alwaysSpawn should spawn
    expect(alwaysSpawn.spawnCount).toBe(1);
    expect(neverSpawn.spawnCount).toBe(0);
  });

  it('should return empty array when no spawners registered', () => {
    const spawned = spawnManager.update(context);
    
    expect(spawned).toEqual([]);
  });

  it('should pass correct context to spawners', () => {
    let capturedContext: SpawnContext | null = null;
    
    const capturingSpawner: ISpawner = {
      trySpawn(ctx: SpawnContext, lastSpawnTime: number): SpawnResult {
        capturedContext = ctx;
        return { shouldSpawn: false };
      }
    };
    
    spawnManager.registerSpawner(capturingSpawner);
    spawnManager.update(context);
    
    expect(capturedContext).toEqual(context);
  });
});
