import { test, expect } from '@playwright/test';

test.describe('Páginas Legais', () => {
  test('termos de uso carrega', async ({ page }) => {
    const response = await page.goto('/termos');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/termos/i);
  });

  test('política de privacidade carrega', async ({ page }) => {
    const response = await page.goto('/privacidade');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/privacidade/i);
  });

  test('DMCA carrega', async ({ page }) => {
    const response = await page.goto('/dmca');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/dmca/i);
  });

  test('páginas legais têm conteúdo', async ({ page }) => {
    await page.goto('/termos');
    const content = page.locator('main, article, .prose, [class*="max-w"]');
    await expect(content.first()).toBeVisible();
    // Deve ter texto substancial
    const text = await content.first().textContent();
    expect(text?.length).toBeGreaterThan(100);
  });
});
