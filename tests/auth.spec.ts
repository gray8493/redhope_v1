import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should load login page', async ({ page }) => {
        // Navigating to the app
        await page.goto('/');

        // Click login
        await page.click('text=Đăng nhập');

        // Make sure we're on login page
        await expect(page).toHaveURL(/.*login/);
        await expect(page.locator('h2')).toContainText('Đăng nhập');
    });

    test('should load register page', async ({ page }) => {
        // Navigating to the app
        await page.goto('/');

        // Click register or login then register
        await page.goto('/register');

        await expect(page).toHaveURL(/.*register/);
        await expect(page.locator('h2')).toContainText('Tạo tài khoản');
    });
});
