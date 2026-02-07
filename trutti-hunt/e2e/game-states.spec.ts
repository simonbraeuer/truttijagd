import { gameTest as test, expect } from './fixtures';

test.describe('Pause and Resume', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should pause the game', async ({ gamePage }) => {
    await gamePage.startGame('Andi');
    
    const timeBefore = await gamePage.getTimeRemaining();
    
    await gamePage.pauseGame();
    
    // Pause button should change to Resume
    await expect(gamePage.page.locator('button:has-text("Resume")')).toBeVisible();
    
    // Wait 2 seconds while paused
    await gamePage.page.waitForTimeout(2000);
    
    const timeAfter = await gamePage.getTimeRemaining();
    
    // Time should not have changed (or changed very little due to timing)
    expect(Math.abs(timeAfter - timeBefore)).toBeLessThanOrEqual(1);
  });

  test('should resume the game after pause', async ({ gamePage }) => {
    await gamePage.startGame('Kevin');
    
    await gamePage.pauseGame();
    await expect(gamePage.page.locator('button:has-text("Resume")')).toBeVisible();
    
    await gamePage.resumeGame();
    await expect(gamePage.page.locator('button:has-text("Pause")')).toBeVisible();
    
    // Timer should continue after resume
    const timeBefore = await gamePage.getTimeRemaining();
    await gamePage.page.waitForTimeout(2000);
    const timeAfter = await gamePage.getTimeRemaining();
    
    expect(timeAfter).toBeLessThan(timeBefore);
  });

  test('should maintain score during pause', async ({ gamePage }) => {
    await gamePage.startGame('Andi');
    
    // Play a bit
    await gamePage.page.waitForTimeout(2000);
    for (let i = 0; i < 5; i++) {
      await gamePage.clickObject(i);
      await gamePage.page.waitForTimeout(200);
    }
    
    const scoreBefore = await gamePage.getScore();
    
    await gamePage.pauseGame();
    await gamePage.page.waitForTimeout(1000);
    
    const scoreDuringPause = await gamePage.getScore();
    expect(scoreDuringPause).toBe(scoreBefore);
    
    await gamePage.resumeGame();
    await gamePage.page.waitForTimeout(500);
    
    const scoreAfter = await gamePage.getScore();
    expect(scoreAfter).toBeGreaterThanOrEqual(scoreBefore);
  });

  test('should not allow clicking objects while paused', async ({ gamePage }) => {
    await gamePage.startGame('Kevin');
    
    await gamePage.page.waitForTimeout(1000);
    const scoreBefore = await gamePage.getScore();
    
    await gamePage.pauseGame();
    
    // Try clicking while paused
    for (let i = 0; i < 10; i++) {
      await gamePage.clickObject(i);
      await gamePage.page.waitForTimeout(100);
    }
    
    const scoreAfter = await gamePage.getScore();
    
    // Score should not change significantly
    expect(scoreAfter).toBe(scoreBefore);
  });

  test('should handle multiple pause/resume cycles', async ({ gamePage }) => {
    await gamePage.startGame('Andi');
    
    for (let cycle = 0; cycle < 3; cycle++) {
      await gamePage.page.waitForTimeout(1000);
      await gamePage.pauseGame();
      await gamePage.page.waitForTimeout(500);
      await gamePage.resumeGame();
    }
    
    // Game should still be functional
    expect(await gamePage.isGameRunning()).toBe(true);
    const time = await gamePage.getTimeRemaining();
    expect(time).toBeGreaterThan(0);
  });
});

test.describe('Game Over', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should end game when timer reaches zero', async ({ gamePage, page }) => {
    await gamePage.startGame('Andi');
    
    // Wait for game to end (with timeout)
    await expect(page.locator('text=/Game Over|Final Score/i')).toBeVisible({ timeout: 100000 });
  });

  test('should display final score at game over', async ({ gamePage, page }) => {
    await gamePage.startGame('Kevin');
    
    // Play a bit to get some score
    for (let i = 0; i < 10; i++) {
      await gamePage.clickObject(i);
      await gamePage.page.waitForTimeout(300);
    }
    
    // Wait for game over (shortened for testing)
    await expect(page.locator('text=/Game Over|Final Score/i')).toBeVisible({ timeout: 100000 });
    
    // Check that a score is displayed
    const scoreText = await page.locator('text=/\\$\\d+/').first().textContent();
    expect(scoreText).toMatch(/\$\d+/);
  });

  test('should show scoreboard after game over', async ({ gamePage, page }) => {
    await gamePage.startGame('Andi');
    
    // Wait for game over
    await expect(page.locator('text=/Game Over|Final Score/i')).toBeVisible({ timeout: 100000 });
    
    // Scoreboard should be visible
    await expect(page.locator('text=/High Scores|Scoreboard/i')).toBeVisible({ timeout: 5000 });
  });

  test('should allow restarting after game over', async ({ gamePage, page }) => {
    await gamePage.startGame('Kevin');
    
    // Wait for game over
    await expect(page.locator('text=/Game Over|Final Score/i')).toBeVisible({ timeout: 100000 });
    
    // Should have option to restart
    const restartBtn = page.locator('button:has-text("Play Again"), button:has-text("Start Game")');
    await expect(restartBtn.first()).toBeVisible({ timeout: 5000 });
  });
});
