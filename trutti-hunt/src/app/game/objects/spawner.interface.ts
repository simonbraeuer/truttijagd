import { GameObject } from './game-object';
import type { DifficultyLevel } from '../components/start-screen/start-screen';

export interface SpawnContext {
  canvasWidth: number;
  canvasHeight: number;
  difficulty: DifficultyLevel;
  gameTime: number;
  timeRemaining: number;
}

export interface SpawnResult {
  shouldSpawn: boolean;
  gameObject?: GameObject;
}

export interface ISpawner {
  /**
   * Determines if this spawner should create an object
   * @param context - Current game state
   * @param lastSpawnTime - Last time this spawner created an object
   * @returns SpawnResult indicating if spawn should occur and the spawned object
   */
  trySpawn(context: SpawnContext, lastSpawnTime: number): SpawnResult;
}
