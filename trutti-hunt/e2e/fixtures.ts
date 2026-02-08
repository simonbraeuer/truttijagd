import { test, expect, Page } from '@playwright/test';

/**
 * Test Fixtures for Trutti Hunt Game
 * Provides reusable helpers and utilities for E2E tests
 */

export interface GamePage {
  page: Page;
  startGame: (difficulty?: 'Andi' | 'Schuh' | 'Mexxx') => Promise<void>;
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
        // Set difficulty using the slider
        const slider = page.locator('input.difficulty-slider');
        if (await slider.isVisible()) {
          let sliderValue = 0;
          if (difficulty === 'Schuh') sliderValue = 1;
          if (difficulty === 'Mexxx') sliderValue = 2;
          await slider.fill(sliderValue.toString());
        }
        
        // Click start button
        const startBtn = page.locator('button.start-button, button:has-text("Start Game")');
        await startBtn.click();
        
        // Wait for canvas to be visible
        await page.locator('canvas').waitFor({ state: 'visible' });
        
        // Wait a bit for game to initialize
        await page.waitForTimeout(500);
      },
      
      async pauseGame() {
        // Game pauses with 'P' key, not a button
        await page.keyboard.press('p');
        // Wait for pause overlay to appear
        await page.waitForTimeout(200);
      },
      
      async resumeGame() {
        // Game resumes with 'P' key, not a button
        await page.keyboard.press('p');
        // Wait for pause overlay to disappear
        await page.waitForTimeout(200);
      },
      
      async getScore() {
        // Look for money display in HUD (shows as $XXX without "Score:" label)
        // Try specific class first, then fallback to text pattern
        const scoreLocator = page.locator('.money-display .hud-value').first();
        if (await scoreLocator.isVisible({ timeout: 1000 }).catch(() => false)) {
          const scoreText = await scoreLocator.textContent();
          const match = scoreText?.match(/\$(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        }
        // Fallback: find any element containing $XX pattern
        const fallbackLocator = page.locator('text=/\\$\\d+/').first();
        const scoreText = await fallbackLocator.textContent();
        const match = scoreText?.match(/\$(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      },
      
      async getTimeRemaining() {
        // Look for time display in HUD (shows as XXs without "Time:" label)
        // Look for elements ending with 's' that contain numbers
        const timeLocator = page.locator('.hud-value').filter({ hasText: /\d+s/ }).first();
        if (await timeLocator.isVisible({ timeout: 1000 }).catch(() => false)) {
          const timeText = await timeLocator.textContent();
          const match = timeText?.match(/(\d+)s/);
          return match ? parseInt(match[1], 10) : 0;
        }
        // Fallback: find any element containing XXs pattern
        const fallbackLocator = page.locator('text=/\\d+s/').first();
        const timeText = await fallbackLocator.textContent();
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
        // The audio input is now a text field for URL, not a file upload
        const audioInput = page.locator('input#audioUrl, input.audio-input');
        if (await audioInput.isVisible()) {
          await audioInput.fill(fileName);
        }
      }
    };
    
    await use(gamePage);
  },
});

export { expect };
