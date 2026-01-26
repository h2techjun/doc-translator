
import { test, expect } from '@playwright/test';

test.describe('Translation App', () => {
    test('should load the home page with correct title', async ({ page }) => {
        // Start from the index page (the baseURL is set in playwright.config.ts usually, defaulting to localhost:3000)
        await page.goto('http://localhost:3000/en'); // Explicitly go to /en locale

        // Check title
        await expect(page).toHaveTitle(/Document Translation/i);

        // Check main heading
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(page.getByText('Document Translation AI')).toBeVisible();
    });

    test('should show file dropzone', async ({ page }) => {
        await page.goto('http://localhost:3000/en');

        // Check for dropzone text
        await expect(page.getByText('Upload Document')).toBeVisible();
        await expect(page.getByText('Drag & drop files here')).toBeVisible();
    });

    // Admin and Community tests might require navigation or login, keeping it simple for now
    test('should navigate to community page', async ({ page }) => {
        // Assuming there's a link or we go directly
        await page.goto('http://localhost:3000/en/community');

        await expect(page.getByRole('heading', { name: 'Community Board' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Publish Post' })).toBeVisible();
    });
});
