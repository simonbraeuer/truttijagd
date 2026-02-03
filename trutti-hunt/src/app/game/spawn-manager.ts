import { GameObject } from './objects/game-object';
import { ISpawner, SpawnContext } from './objects/spawners';

interface SpawnerEntry {
  spawner: ISpawner;
  lastSpawnTime: number;
}

export class SpawnManager {
  private spawners: SpawnerEntry[] = [];

  /**
   * Register a spawner with the manager
   */
  registerSpawner(spawner: ISpawner): void {
    this.spawners.push({
      spawner,
      lastSpawnTime: 0
    });
  }

  /**
   * Update all spawners and return newly spawned objects
   */
  update(context: SpawnContext): GameObject[] {
    const newObjects: GameObject[] = [];

    for (const entry of this.spawners) {
      const result = entry.spawner.trySpawn(context, entry.lastSpawnTime);
      
      if (result.shouldSpawn && result.gameObject) {
        newObjects.push(result.gameObject);
        entry.lastSpawnTime = context.gameTime;
      }
    }

    return newObjects;
  }

  /**
   * Reset all spawn timers (useful when restarting game)
   */
  reset(): void {
    for (const entry of this.spawners) {
      entry.lastSpawnTime = 0;
    }
  }
}
