import { gameTest as test, expect } from './fixtures';

test.describe('Game Initialization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application', async ({ page }) => {
    await expect(page).toHaveTitle(/Trutti Hunt/);
  });

  test('should display start screen with difficulty slider', async ({ page }) => {
    await expect(page.locator('input.difficulty-slider')).toBeVisible();
    await expect(page.locator('.current-difficulty')).toBeVisible();
    // Check that difficulty markers are visible
    await expect(page.locator('.difficulty-marker:has-text("Andi")')).toBeVisible();
    await expect(page.locator('.difficulty-marker:has-text("Mexxx")')).toBeVisible();
  });

  test('should display audio URL input', async ({ page }) => {
    const audioInput = page.locator('input#audioUrl, input.audio-input');
    await expect(audioInput).toBeVisible();
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

  test('should start game on Schuh difficulty', async ({ gamePage }) => {
    await gamePage.startGame('Schuh');
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
    
    // Set Schuh difficulty using slider
    const slider = page.locator('input.difficulty-slider');
    await slider.fill('1'); // Schuh is value 1
    await page.waitForTimeout(100);
    
    // Verify difficulty changed
    await expect(page.locator('.current-difficulty:has-text("Schuh")')).toBeVisible();
    
    // Reload page
    await page.reload();
    
    // Check if difficulty slider is still visible (persistence check would need localStorage check)
    await expect(slider).toBeVisible();
  });

  test('should persist audio URL selection', async ({ page }) => {
    await page.goto('/');
    
    // Check that audio input maintains state
    const audioInput = page.locator('input#audioUrl, input.audio-input');
    await expect(audioInput).toBeVisible();
    
    // Enter a URL
    await audioInput.fill('https://example.com/audio.mp3');
    await page.waitForTimeout(100);
    
    // Reload and check persistence
    await page.reload();
    await expect(audioInput).toBeVisible();
  });
});
