import { test, expect } from '@playwright/test';

test.describe('Página da Série', () => {
  test('slug inexistente retorna 404', async ({ page }) => {
    const response = await page.goto('/serie/slug-que-nao-existe-xyz');
    // Next.js retorna 404 para séries não encontradas
    expect(response?.status()).toBe(404);
  });

  test('página 404 exibe mensagem amigável', async ({ page }) => {
    await page.goto('/serie/slug-que-nao-existe-xyz');
    const body = page.locator('body');
    await expect(body).toContainText(/not found|não encontrad|404/i);
  });
});
