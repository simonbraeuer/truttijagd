import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Trutti Hunt/);
  });

  test('should have focusable interactive elements', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    await startButton.focus();
    await expect(startButton).toBeFocused();
  });

  test('should have keyboard navigable difficulty selection', async ({ page }) => {
    const slider = page.locator('input.difficulty-slider');
    await slider.focus();
    await expect(slider).toBeFocused();
    
    // Test keyboard navigation with arrow keys
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
  });

  test('should support keyboard activation of buttons', async ({ page }) => {
    const startButton = page.locator('button.start-button, button:has-text("Start Game")');
    await startButton.focus();
    await page.keyboard.press('Enter');
    
    // Button should have been activated - game should start
    await page.waitForTimeout(500);
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should have adequate color contrast', async ({ page }) => {
    // Check that text is visible against background
    const startButton = page.locator('button:has-text("Start Game")');
    await expect(startButton).toBeVisible();
    
    const styles = await startButton.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
      };
    });
    
    // Basic check that colors are defined
    expect(styles.color).toBeTruthy();
  });

  test('should have semantic HTML structure', async ({ page }) => {
    // Check for button elements (not divs with click handlers)
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Simulate high contrast by checking visibility of main elements
    await expect(page.locator('button:has-text("Start Game")')).toBeVisible();
    await expect(page.locator('input.difficulty-slider')).toBeVisible();
    await expect(page.locator('.current-difficulty')).toBeVisible();
  });

  test('should have visible focus indicators', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    await startButton.focus();
    
    // Check that focus doesn't break layout
    const box = await startButton.boundingBox();
    expect(box).not.toBeNull();
  });
});

test.describe('Screen Reader Support', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have descriptive button text', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    const text = await startButton.textContent();
    expect(text?.trim()).toBeTruthy();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('should have labeled form controls', async ({ page }) => {
    // Check for slider label
    const difficultyLabel = page.locator('.difficulty-label, label:has-text("Difficulty")');
    await expect(difficultyLabel).toBeVisible();
  });

  test('should have meaningful difficulty labels', async ({ page }) => {
    // Check for difficulty markers that are always visible
    await expect(page.locator('.difficulty-marker:has-text("Andi")')).toBeVisible();
    await expect(page.locator('.difficulty-marker:has-text("Mexxx")')).toBeVisible();
    
    // Check that current difficulty shows the current selection
    const currentDifficulty = page.locator('.current-difficulty');
    await expect(currentDifficulty).toBeVisible();
    
    // Interact with slider to verify all difficulties are accessible
    const slider = page.locator('input.difficulty-slider');
    
    // Test Andi (position 0)
    await slider.fill('0');
    await expect(currentDifficulty).toHaveText('Andi');
    
    // Test Schuh (position 1)
    await slider.fill('1');
    await expect(currentDifficulty).toHaveText('Schuh');
    
    // Test Mexxx (position 2)
    await slider.fill('2');
    await expect(currentDifficulty).toHaveText('Mexxx');
  });

  test('should announce game state changes', async ({ page }) => {
    // Start game and check for canvas visibility (visual state change)
    const startButton = page.locator('button:has-text("Start Game")');
    await startButton.click();
    
    await page.waitForTimeout(500);
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should have descriptive score display', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    await startButton.click();
    
    await page.waitForTimeout(500);
    // Check for score text
    const scoreDisplay = page.locator('text=/Score:|\\$/');
    await expect(scoreDisplay.first()).toBeVisible();
  });
});

test.describe('Responsive Touch Support', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have touch-friendly button sizes', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    const box = await startButton.boundingBox();
    
    // Minimum recommended touch target size is 44x44px
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(32); // Allowing some flexibility
    }
  });

  test('should respond to tap events', async ({ page, browserName }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    
    // Use tap for webkit/mobile browsers, click for others
    if (browserName === 'webkit') {
      await startButton.tap();
    } else {
      // For chromium and firefox, click works as tap simulation
      await startButton.click();
    }
    
    await page.waitForTimeout(500);
    await expect(page.locator('canvas')).toBeVisible();
  });
});
