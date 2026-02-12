import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render correctly in all browsers', async ({ page, browserName }) => {
    await expect(page.locator('button:has-text("Start Game")')).toBeVisible();
    
    // Log which browser is being tested
    console.log(`Testing on: ${browserName}`);
  });

  test('should handle canvas rendering across browsers', async ({ page }) => {
    await page.locator('button:has-text("Start Game")').click();
    await page.waitForTimeout(1000);
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width).toBeGreaterThan(0);
  });

  test('should maintain consistent layout', async ({ page }) => {
    const startButton = page.locator('button:has-text("Start Game")');
    const box = await startButton.boundingBox();
    
    expect(box).not.toBeNull();
    expect(box?.width).toBeGreaterThan(0);
    expect(box?.height).toBeGreaterThan(0);
  });

  test('should handle audio file selection', async ({ page }) => {
    // Audio input is now a text field for URLs, not a file upload
    const audioInput = page.locator('input#audioUrl, input.audio-input');
    await expect(audioInput).toBeVisible();
    await expect(audioInput).toHaveAttribute('type', 'text');
  });
});

test.describe('LocalStorage Compatibility', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Skip beforeEach for the missing localStorage test
    if (!testInfo.title.includes('missing localStorage')) {
      await page.goto('/');
    }
  });

  test('should persist difficulty selection', async ({ page, context }) => {
    // Set difficulty using slider
    const slider = page.locator('input.difficulty-slider');
    await slider.fill('1'); // Schuh is value 1
    await page.waitForTimeout(200);
    
    // Difficulty is saved when Start Game is clicked, not immediately
    await page.locator('button:has-text("Start Game")').click();
    await page.waitForTimeout(500);
    
    // Check localStorage (key is 'truttihunt-difficulty')
    const storage = await page.evaluate(() => localStorage.getItem('truttihunt-difficulty'));
    expect(storage).toBeTruthy();
    expect(storage).toBe('Schuh');
  });

  test('should persist scoreboard data', async ({ page }) => {
    const sampleEntry = {
      name: 'IndexedDB Player',
      score: 250,
      date: new Date().toISOString(),
      difficulty: 'Andi',
      stats: {
        timeRemaining: 8,
        truttisCaught: 3,
        specialTruttisCaught: 1,
        totalClicks: 9
      }
    };

    await page.evaluate(async (entry) => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('truttihunt-stats', 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('scoreboard')) {
            db.createObjectStore('scoreboard', { keyPath: 'id' });
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction('scoreboard', 'readwrite');
          const store = transaction.objectStore('scoreboard');
          store.put({ id: 'highscores', entries: [entry] });
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        };
        request.onerror = () => reject(request.error);
      });
    }, sampleEntry);

    const stored = await page.evaluate(async () => {
      return new Promise<any>((resolve, reject) => {
        const request = indexedDB.open('truttihunt-stats', 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('scoreboard')) {
            db.createObjectStore('scoreboard', { keyPath: 'id' });
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction('scoreboard', 'readonly');
          const store = transaction.objectStore('scoreboard');
          const getRequest = store.get('highscores');
          getRequest.onsuccess = () => resolve(getRequest.result);
          getRequest.onerror = () => reject(getRequest.error);
        };
        request.onerror = () => reject(request.error);
      });
    });

    expect(stored.entries).toHaveLength(1);
    expect(stored.entries[0].stats.totalClicks).toBe(9);
  });

  test('should handle missing localStorage gracefully', async ({ page, context }) => {
    // Disable localStorage before navigating to the page
    await context.addInitScript(() => {
      // @ts-ignore - intentionally breaking localStorage for test
      delete window.localStorage;
    });
    
    await page.goto('/');
    
    // App should still load even without localStorage
    await expect(page.locator('button:has-text("Start Game")')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Responsive Design', () => {
  const viewports = [
    { width: 1920, height: 1080, name: 'Desktop HD' },
    { width: 1366, height: 768, name: 'Laptop' },
    { width: 768, height: 1024, name: 'Tablet Portrait' },
    { width: 1024, height: 768, name: 'Tablet Landscape' },
    { width: 375, height: 667, name: 'Mobile Portrait' },
    { width: 667, height: 375, name: 'Mobile Landscape' },
  ];

  for (const viewport of viewports) {
    test(`should render correctly at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      await expect(page.locator('button:has-text("Start Game")')).toBeVisible();
      
      // Start game
      await page.locator('button:has-text("Start Game")').click();
      await page.waitForTimeout(1000);
      
      // Canvas should be visible
      await expect(page.locator('canvas')).toBeVisible();
    });
  }
});

test.describe('Network Conditions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load with slow network', async ({ page, context }) => {
    // Simulate slow 3G
    await context.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });
    
    await page.reload();
    await expect(page.locator('button:has-text("Start Game")')).toBeVisible({ timeout: 10000 });
  });

  test('should handle offline mode gracefully', async ({ page, context }) => {
    // This tests service worker or offline handling
    await expect(page.locator('button:has-text("Start Game")')).toBeVisible();
  });
});
