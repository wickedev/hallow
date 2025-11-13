import { test, expect } from '@playwright/test';

test.describe('Error Check - Methods Getter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/');
  });

  test('should NOT show "Cannot read properties of undefined (reading greet)" error', async ({ page }) => {
    // Enter name
    await page.fill('input[placeholder="Enter your name"]', 'TestUser');

    // Click send button
    await page.click('button:has-text("Send Greeting")');

    // Wait for either result or error
    await expect(page.locator('.result, .error-display')).toBeVisible({ timeout: 10000 });

    // Check if error is displayed
    const errorDisplay = page.locator('.error-display');
    const isErrorVisible = await errorDisplay.isVisible().catch(() => false);

    if (isErrorVisible) {
      // Get the error text
      const errorText = await errorDisplay.textContent();
      
      // Fail if the specific error is present
      expect(errorText).not.toContain("Cannot read properties of undefined (reading 'greet')");
      
      // Also fail for any other errors (we want success)
      throw new Error(`Expected successful response, but got error: ${errorText}`);
    }

    // If no error, verify success
    await expect(page.locator('.result')).toBeVisible();
    await expect(page.locator('.greeting-reply')).toBeVisible();
  });
});
