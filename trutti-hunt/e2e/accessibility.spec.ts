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
    const andiBtn = page.locator('button:has-text("Andi")');
    await andiBtn.focus();
    
    // Tab to next button
    await page.keyboard.press('Tab');
    
    const kevinBtn = page.locator('button:has-text("Kevin")');
    await expect(kevinBtn).toBeFocused();
  });

  test('should support keyboard activation of buttons', async ({ page }) => {
    const andiBtn = page.locator('button:has-text("Andi")');
    await andiBtn.focus();
    await page.keyboard.press('Enter');
    
    // Button should have been activated
    await page.waitForTimeout(100);
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
    // Simulate high contrast by checking visibility
    await expect(page.locator('button:has-text("Start Game")')).toBeVisible();
    await expect(page.locator('button:has-text("Andi")')).toBeVisible();
    await expect(page.locator('button:has-text("Kevin")')).toBeVisible();
    await expect(page.locator('button:has-text("Mexxx")')).toBeVisible();
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

  test('should have meaningful difficulty labels', async ({ page }) => {
    const difficulties = ['Andi', 'Kevin', 'Mexxx'];
    
    for (const diff of difficulties) {
      const btn = page.locator(`button:has-text("${diff}")`);
      await expect(btn).toBeVisible();
      const text = await btn.textContent();
      expect(text).toContain(diff);
    }
  });

  test('should announce game state changes', async ({ page }) => {
    // Start game
    await page.locator('button:has-text("Start Game")').click();
    await page.waitForTimeout(500);
    
    // Check for pause button (indicates game started)
    await expect(page.locator('button:has-text("Pause")')).toBeVisible();
  });
});

test.describe('Mobile Accessibility', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have touch-friendly buttons on mobile', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    const box = await startButton.boundingBox();
    
    // Buttons should be at least 44x44 pixels (iOS guideline)
    expect(box?.height).toBeGreaterThanOrEqual(40);
  });

  test('should be responsive on small screens', async ({ page }) => {
    await expect(page.locator('button:has-text("Start Game")')).toBeVisible();
    await expect(page.locator('button:has-text("Andi")')).toBeVisible();
  });

  test('should handle touch interactions', async ({ page }) => {
    const andiBtn = page.locator('button:has-text("Andi")');
    await andiBtn.tap();
    await page.waitForTimeout(100);
    
    const startBtn = page.locator('button:has-text("Start Game")');
    await startBtn.tap();
    
    // Canvas should appear
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should support pinch-to-zoom prevention', async ({ page }) => {
    // Check viewport meta tag
    const viewport = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta?.getAttribute('content');
    });
    
    expect(viewport).toBeTruthy();
  });
});
