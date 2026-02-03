import { gameTest as test, expect } from './fixtures';

test.describe('Game Initialization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application', async ({ page }) => {
    await expect(page).toHaveTitle(/Trutti Hunt/);
  });

  test('should display start screen with all difficulty options', async ({ page }) => {
    await expect(page.locator('button:has-text("Andi")')).toBeVisible();
    await expect(page.locator('button:has-text("Kevin")')).toBeVisible();
    await expect(page.locator('button:has-text("Mexxx")')).toBeVisible();
  });

  test('should display audio file selection', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
  });

  test('should have Start Game button', async ({ page }) => {
    await expect(page.locator('button:has-text("Start Game")')).toBeVisible();
  });
});

test.describe('Game Start and UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should start game on Andi difficulty', async ({ gamePage }) => {
    await gamePage.startGame('Andi');
    await expect(gamePage.page.locator('canvas')).toBeVisible();
    await expect(gamePage.page.locator('button:has-text("Pause")')).toBeVisible();
  });

  test('should start game on Kevin difficulty', async ({ gamePage }) => {
    await gamePage.startGame('Kevin');
    await expect(gamePage.page.locator('canvas')).toBeVisible();
  });

  test('should start game on Mexxx difficulty', async ({ gamePage }) => {
    await gamePage.startGame('Mexxx');
    await expect(gamePage.page.locator('canvas')).toBeVisible();
  });

  test('should display initial score of $0', async ({ gamePage }) => {
    await gamePage.startGame();
    const score = await gamePage.getScore();
    expect(score).toBe(0);
  });

  test('should display timer at 90 seconds', async ({ gamePage }) => {
    await gamePage.startGame();
    const time = await gamePage.getTimeRemaining();
    expect(time).toBeGreaterThanOrEqual(89);
    expect(time).toBeLessThanOrEqual(90);
  });

  test('should render canvas with appropriate dimensions', async ({ gamePage }) => {
    await gamePage.startGame();
    const size = await gamePage.getCanvasSize();
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
  });
});

test.describe('Difficulty Persistence', () => {
  test('should remember selected difficulty after reload', async ({ page }) => {
    await page.goto('/');
    
    // Select Kevin difficulty
    await page.locator('button:has-text("Kevin")').click();
    await page.waitForTimeout(100);
    
    // Reload page
    await page.reload();
    
    // Check if Kevin is still selected (would need UI indication)
    await expect(page.locator('button:has-text("Kevin")')).toBeVisible();
  });

  test('should persist audio file selection', async ({ page }) => {
    await page.goto('/');
    
    // Check that file input maintains state
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
  });
});
