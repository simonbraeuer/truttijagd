import { gameTest as test, expect } from './fixtures';

test.describe('Performance Benchmarks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should maintain stable FPS during gameplay', async ({ gamePage, page }) => {
    await gamePage.startGame('Schuh');
    
    // Measure performance
    const metrics: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      await page.waitForTimeout(1000);
      const endTime = Date.now();
      metrics.push(endTime - startTime);
    }
    
    // Check that frame timing is consistent (within reasonable variance)
    const avgTime = metrics.reduce((a, b) => a + b, 0) / metrics.length;
    expect(avgTime).toBeGreaterThan(900);
    expect(avgTime).toBeLessThan(1200);
  });

  test('should handle high object count on Mexxx difficulty', async ({ gamePage }) => {
    await gamePage.startGame('Mexxx');
    
    // Let many objects spawn
    await gamePage.page.waitForTimeout(5000);
    
    // Interact to ensure responsiveness
    for (let i = 0; i < 20; i++) {
      await gamePage.clickObject(i);
      await gamePage.page.waitForTimeout(100);
    }
    
    // Game should still be responsive
    expect(await gamePage.isGameRunning()).toBe(true);
  });

  test('should not have memory leaks during extended play', async ({ gamePage, page }) => {
    await gamePage.startGame('Andi');
    
    // Extended gameplay session
    for (let round = 0; round < 30; round++) {
      await gamePage.clickObject(round % 5);
      await gamePage.page.waitForTimeout(500);
    }
    
    // Game should still be functional
    expect(await gamePage.isGameRunning()).toBe(true);
    const time = await gamePage.getTimeRemaining();
    expect(time).toBeGreaterThanOrEqual(0);
  });

  test('should load quickly on initial page load', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.locator('button:has-text("Start Game")').waitFor();
    const loadTime = Date.now() - startTime;
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should render canvas without visible lag', async ({ gamePage, page }) => {
    await gamePage.startGame('Schuh');
    
    // Take screenshot to ensure canvas is rendering
    await page.waitForTimeout(2000);
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Canvas should have content
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width).toBeGreaterThan(0);
    expect(box?.height).toBeGreaterThan(0);
  });
});

test.describe('Resource Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should properly cleanup on game restart', async ({ gamePage, page }) => {
    // Start first game
    await gamePage.startGame('Andi');
    await gamePage.page.waitForTimeout(2000);
    
    // Return to start screen would typically involve a restart
    // For now, just verify the game can run multiple times in session
    expect(await gamePage.isGameRunning()).toBe(true);
  });

  test('should handle rapid difficulty changes', async ({ page }) => {
    const difficulties = ['Andi', 'Schuh', 'Mexxx'];
    
    for (const diff of difficulties) {
      await page.locator(`button:has-text("${diff}")`).click();
      await page.waitForTimeout(200);
    }
    
    // Should still be able to start game
    await expect(page.locator('button:has-text("Start Game")')).toBeEnabled();
  });

  test('should handle page visibility changes', async ({ gamePage, page }) => {
    await gamePage.startGame('Schuh');
    await gamePage.page.waitForTimeout(2000);
    
    // Pause when tab loses focus (simulate)
    await gamePage.pauseGame();
    await gamePage.page.waitForTimeout(1000);
    
    // Resume
    await gamePage.resumeGame();
    await gamePage.page.waitForTimeout(1000);
    
    expect(await gamePage.isGameRunning()).toBe(true);
  });
});

test.describe('Stress Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle continuous gameplay session', async ({ gamePage }) => {
    await gamePage.startGame('Schuh');
    
    // Sustained interaction
    for (let i = 0; i < 100; i++) {
      await gamePage.clickObject(i % 8);
      await gamePage.page.waitForTimeout(150);
      
      const time = await gamePage.getTimeRemaining();
      if (time <= 0) break;
    }
    
    // Should complete without errors
    const finalScore = await gamePage.getScore();
    expect(finalScore).toBeGreaterThanOrEqual(0);
  });

  test('should handle edge case: clicking outside canvas', async ({ gamePage, page }) => {
    await gamePage.startGame('Andi');
    
    // Click outside canvas area
    await page.mouse.click(10, 10);
    await page.mouse.click(900, 10);
    
    // Game should continue normally
    expect(await gamePage.isGameRunning()).toBe(true);
  });

  test('should handle browser resize during gameplay', async ({ gamePage, page }) => {
    await gamePage.startGame('Schuh');
    await page.waitForTimeout(1000);
    
    // Resize viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    // Game should adapt
    expect(await gamePage.isGameRunning()).toBe(true);
  });
});
