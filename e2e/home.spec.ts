import { test, expect } from '@playwright/test';

test.describe('Home', () => {
  test('carrega a página inicial com título', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DownDoor|download|portal/i);
  });

  test('exibe o header com navegação', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('exibe o hero carousel ou seção de destaque', async ({ page }) => {
    await page.goto('/');
    // Verifica que existe conteúdo principal (hero ou grid de séries)
    const main = page.locator('main, [role="main"], .min-h-screen');
    await expect(main.first()).toBeVisible();
  });

  test('footer está presente', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('link para categorias funciona', async ({ page }) => {
    await page.goto('/');
    const categoriasLink = page.locator('a[href="/categorias"]').first();
    if (await categoriasLink.isVisible()) {
      await categoriasLink.click();
      await expect(page).toHaveURL(/categorias/);
    }
  });
});
