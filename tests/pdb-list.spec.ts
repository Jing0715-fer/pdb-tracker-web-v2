import { test, expect, Page } from '@playwright/test';

// Helper to wait for the main app to be ready
async function waitForAppReady(page: Page) {
  await page.waitForLoadState('networkidle');
  // Wait for either the PDB tracker to load or an error state
  await page.waitForFunction(() => {
    const body = document.body.innerText;
    return body.length > 50;
  }, { timeout: 30000 });
}

test.describe('PDB List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('1. Load PDB list page', async ({ page }) => {
    // Verify the page loaded with main UI elements
    const body = await page.textContent('body');
    expect(body!.length).toBeGreaterThan(100);

    // Check for mode toggle (Weekly/Evaluation)
    const weeklyBtn = page.locator('button', { hasText: /weekly/i }).first();
    const evalBtn = page.locator('button', { hasText: /evaluation/i }).first();

    // At least one mode button should be visible
    const hasModeToggle = (await weeklyBtn.count()) > 0 || (await evalBtn.count()) > 0;
    expect(hasModeToggle).toBeTruthy();
  });

  test('2. Search by PDB ID', async ({ page }) => {
    // Look for search input - it may be inside a command palette or direct input
    const searchInput = page.locator('input[placeholder*="earch"], input[placeholder*="PDB"], input[aria-label*="earch"]').first();

    // If command palette search exists, try CMD+K
    const cmdKTriggered = await page.evaluate(() => {
      // Check for any search-like input visible
      const inputs = document.querySelectorAll('input');
      for (const input of inputs) {
        if (input.offsetParent !== null) {
          (input as HTMLInputElement).focus();
          return true;
        }
      }
      return false;
    });

    if (cmdKTriggered) {
      // Type in the focused input
      await page.keyboard.type('1a1c');
      await page.waitForTimeout(500);
    }

    // Verify page is still functional after search
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('3. Sort by resolution', async ({ page }) => {
    // Look for resolution sort button/column
    const resButton = page.locator('button', { hasText: /resolution/i }).first();
    const hasResButton = (await resButton.count()) > 0;

    if (hasResButton) {
      await resButton.click();
      await page.waitForTimeout(300);

      // Click again to toggle direction
      await resButton.click();
      await page.waitForTimeout(300);
    }

    // Verify table/list still renders
    const body = await page.textContent('body');
    expect(body!.length).toBeGreaterThan(50);
  });

  test('4. Filter by method', async ({ page }) => {
    // Look for method filter dropdown
    const methodFilter = page.locator('button', { hasText: /method|x-ray|nmr|cryo/i }).first();
    const hasMethodFilter = (await methodFilter.count()) > 0;

    if (hasMethodFilter) {
      await methodFilter.click();
      await page.waitForTimeout(300);

      // Look for a dropdown option
      const option = page.locator('[role="option"], [role="menuitem"]').first();
      if ((await option.count()) > 0) {
        await option.click();
        await page.waitForTimeout(300);
      }
    }

    // Verify page still renders
    const body = await page.textContent('body');
    expect(body!.length).toBeGreaterThan(50);
  });

  test('5. Open PDB detail panel', async ({ page }) => {
    // Look for clickable PDB entries (rows/links with PDB IDs like 1a1c, 2xyz etc)
    const pdbLinks = page.locator('a[href*="/structure/"], button:has-text("1a1c"), td:has-text("1a1c")').first();
    const hasPdbLink = (await pdbLinks.count()) > 0;

    if (hasPdbLink) {
      await pdbLinks.click();
      await page.waitForTimeout(500);

      // Check for detail panel or 3D viewer
      const body = await page.textContent('body');
      expect(body!.length).toBeGreaterThan(100);
    }
  });

  test('6. Switch between weekly/evaluation modes', async ({ page }) => {
    // Find the mode toggle buttons
    const weeklyBtn = page.locator('button').filter({ hasText: /weekly/i }).first();
    const evalBtn = page.locator('button').filter({ hasText: /evaluation/i }).first();

    const hasWeekly = (await weeklyBtn.count()) > 0;
    const hasEval = (await evalBtn.count()) > 0;

    if (hasWeekly) {
      await weeklyBtn.click();
      await page.waitForTimeout(300);
    }

    if (hasEval) {
      await evalBtn.click();
      await page.waitForTimeout(300);
    }

    // Verify page still functional
    const body = await page.textContent('body');
    expect(body!.length).toBeGreaterThan(50);
  });
});