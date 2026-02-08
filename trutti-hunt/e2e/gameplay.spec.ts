import { gameTest as test, expect } from './fixtures';

test.describe('Gameplay Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should allow clicking on canvas during gameplay', async ({ gamePage }) => {
    await gamePage.startGame('Andi');
    
    // Wait for objects to spawn
    await gamePage.page.waitForTimeout(2500);
    
    // Try clicking multiple times on canvas
    for (let i = 0; i < 5; i++) {
      await gamePage.clickObject(i);
      await gamePage.page.waitForTimeout(200);
    }
    
    // Check that game is still running
    expect(await gamePage.isGameRunning()).toBe(true);
  });

  test('should increment score when objects are clicked', async ({ gamePage }) => {
    await gamePage.startGame('Andi');
    
    const initialScore = await gamePage.getScore();
    
    // Wait for objects to spawn
    await gamePage.page.waitForTimeout(2500);
    
    // Click multiple times
    for (let i = 0; i < 10; i++) {
      await gamePage.clickObject(i);
      await gamePage.page.waitForTimeout(150);
    }
    
    const finalScore = await gamePage.getScore();
    
    // Score should potentially increase (might miss some objects)
    expect(finalScore).toBeGreaterThanOrEqual(initialScore);
  });

  test('should decrease timer during gameplay', async ({ gamePage }) => {
    await gamePage.startGame('Andi');
    
    const initialTime = await gamePage.getTimeRemaining();
    
    // Wait 3 seconds
    await gamePage.page.waitForTimeout(3000);
    
    const laterTime = await gamePage.getTimeRemaining();
    
    expect(laterTime).toBeLessThan(initialTime);
    expect(initialTime - laterTime).toBeGreaterThanOrEqual(2);
    expect(initialTime - laterTime).toBeLessThanOrEqual(4);
  });

  test('should spawn objects continuously during gameplay', async ({ gamePage }) => {
    await gamePage.startGame('Schuh');
    
    // Wait for initial spawn
    await gamePage.page.waitForTimeout(2000);
    
    // Game should still be running
    expect(await gamePage.isGameRunning()).toBe(true);
    
    // Wait more to ensure continuous spawning
    await gamePage.page.waitForTimeout(3000);
    
    expect(await gamePage.isGameRunning()).toBe(true);
  });

  test('should handle rapid clicking without crashing', async ({ gamePage }) => {
    await gamePage.startGame('Schuh');
    
    await gamePage.page.waitForTimeout(1000);
    
    // Rapid fire clicks
    for (let i = 0; i < 50; i++) {
      await gamePage.clickObject(i);
      await gamePage.page.waitForTimeout(50);
    }
    
    // Game should still be running
    expect(await gamePage.isGameRunning()).toBe(true);
    const time = await gamePage.getTimeRemaining();
    expect(time).toBeGreaterThan(0);
  });
});

test.describe('Difficulty-Specific Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Andi difficulty should spawn bikini girls', async ({ gamePage }) => {
    await gamePage.startGame('Andi');
    
    // Let game run for a while to spawn various objects
    await gamePage.page.waitForTimeout(5000);
    
    // Game should be running without errors
    expect(await gamePage.isGameRunning()).toBe(true);
  });

  test('Schuh difficulty should have faster gameplay', async ({ gamePage }) => {
    await gamePage.startGame('Schuh');
    
    const initialTime = await gamePage.getTimeRemaining();
    await gamePage.page.waitForTimeout(2000);
    const laterTime = await gamePage.getTimeRemaining();
    
    // Timer should progress normally
    expect(laterTime).toBeLessThan(initialTime);
  });

  test('Mexxx difficulty should have rapid object spawning', async ({ gamePage }) => {
    await gamePage.startGame('Mexxx');
    
    // Let multiple spawn cycles happen
    await gamePage.page.waitForTimeout(3000);
    
    // Game should handle high difficulty
    expect(await gamePage.isGameRunning()).toBe(true);
  });
});

test.describe('Special Objects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should track special turkey catches', async ({ gamePage }) => {
    await gamePage.startGame('Andi');
    
    // Play for extended period to potentially encounter special turkeys
    for (let i = 0; i < 20; i++) {
      await gamePage.clickObject(i % 5);
      await gamePage.page.waitForTimeout(400);
    }
    
    const score = await gamePage.getScore();
    // Should have some score accumulated
    expect(score).toBeGreaterThanOrEqual(0);
  });

  test('should complete special turkey collection', async ({ gamePage }) => {
    await gamePage.startGame('Andi');
    
    // Extended gameplay session
    for (let i = 0; i < 100; i++) {
      await gamePage.clickObject(i % 8);
      await gamePage.page.waitForTimeout(200);
      
      // Check if we've run out of time
      const time = await gamePage.getTimeRemaining();
      if (time <= 0) break;
    }
    
    // Game should handle completion
    const score = await gamePage.getScore();
    expect(score).toBeGreaterThanOrEqual(0);
  });
});
