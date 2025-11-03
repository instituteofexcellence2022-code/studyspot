/**
 * Login E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: /login/i }).click();
    
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();
    
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
  });

  test('should handle login failure', async ({ page }) => {
    await page.getByLabel(/email/i).fill('admin@studyspot.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /login/i }).click();
    
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: '1',
              email: 'admin@studyspot.com',
              firstName: 'Admin',
              lastName: 'User',
              role: 'super_admin',
              tenantId: 'tenant-1',
              isActive: true,
            },
            token: 'mock-jwt-token',
            refreshToken: 'mock-refresh-token',
          },
        }),
      });
    });

    await page.getByLabel(/email/i).fill('admin@studyspot.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('should remember login when remember me is checked', async ({ page }) => {
    await page.getByLabel(/email/i).fill('admin@studyspot.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByLabel(/remember me/i).check();
    await page.getByRole('button', { name: /login/i }).click();
    
    // Check that token is stored in localStorage
    const token = await page.evaluate(() => localStorage.getItem('studyspot_auth_token'));
    expect(token).toBeTruthy();
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/email/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/password/i)).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /login/i })).toBeFocused();
  });

  test('should be accessible with screen reader', async ({ page }) => {
    // Check for proper ARIA labels
    await expect(page.getByLabel(/email/i)).toHaveAttribute('aria-required', 'true');
    await expect(page.getByLabel(/password/i)).toHaveAttribute('aria-required', 'true');
    
    // Check for form labels
    await expect(page.getByText(/email address/i)).toBeVisible();
    await expect(page.getByText(/password/i)).toBeVisible();
  });
});
