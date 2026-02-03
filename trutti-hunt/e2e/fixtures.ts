import { test, expect, Page } from '@playwright/test';

/**
 * Test Fixtures for Trutti Hunt Game
 * Provides reusable helpers and utilities for E2E tests
 */

export interface GamePage {
  page: Page;
  startGame: (difficulty?: 'Andi' | 'Kevin' | 'Mexxx') => Promise<void>;
  pauseGame: () => Promise<void>;
  resumeGame: () => Promise<void>;
  getScore: () => Promise<number>;
  getTimeRemaining: () => Promise<number>;
  clickObject: (index: number) => Promise<void>;
  waitForGameOver: () => Promise<void>;
  isGameRunning: () => Promise<boolean>;
  getCanvasSize: () => Promise<{ width: number; height: number }>;
  selectAudioFile: (fileName: string) => Promise<void>;
}

export const gameTest = test.extend<{ gamePage: GamePage }>({
  gamePage: async ({ page }, use) => {
    const gamePage: GamePage = {
      page,
      
      async startGame(difficulty = 'Andi') {
        // Select difficulty if not already selected
        const difficultyBtn = page.locator(`button:has-text("${difficulty}")`);
        if (await difficultyBtn.isVisible()) {
          await difficultyBtn.click();
        }
        
        // Click start button
        const startBtn = page.locator('button:has-text("Start Game")');
        await startBtn.click();
        
        // Wait for canvas to be visible
        await page.locator('canvas').waitFor({ state: 'visible' });
        
        // Wait a bit for game to initialize
        await page.waitForTimeout(500);
      },
      
      async pauseGame() {
        await page.locator('button:has-text("Pause")').click();
      },
      
      async resumeGame() {
        await page.locator('button:has-text("Resume")').click();
      },
      
      async getScore() {
        const scoreText = await page.locator('text=/Score:.*\\$\\d+/').textContent();
        const match = scoreText?.match(/\$(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      },
      
      async getTimeRemaining() {
        const timeText = await page.locator('text=/Time:.*\\d+s/').textContent();
        const match = timeText?.match(/(\d+)s/);
        return match ? parseInt(match[1], 10) : 0;
      },
      
      async clickObject(index = 0) {
        const canvas = page.locator('canvas');
        const box = await canvas.boundingBox();
        if (box) {
          // Click in different areas based on index for variety
          const x = box.x + box.width * (0.3 + (index * 0.1) % 0.4);
          const y = box.y + box.height * (0.3 + (index * 0.15) % 0.4);
          await page.mouse.click(x, y);
        }
      },
      
      async waitForGameOver() {
        await page.locator('text=/Game Over/i').waitFor({ timeout: 120000 });
      },
      
      async isGameRunning() {
        return await page.locator('canvas').isVisible();
      },
      
      async getCanvasSize() {
        const canvas = page.locator('canvas');
        const box = await canvas.boundingBox();
        return box ? { width: box.width, height: box.height } : { width: 0, height: 0 };
      },
      
      async selectAudioFile(fileName: string) {
        // This would need actual file upload implementation
        // For now, just check if the input exists
        const fileInput = page.locator('input[type="file"]');
        await fileInput.waitFor({ state: 'visible' });
      }
    };
    
    await use(gamePage);
  },
});

export { expect };
