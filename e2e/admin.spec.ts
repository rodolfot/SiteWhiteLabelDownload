import { test, expect } from '@playwright/test';

test.describe('Admin', () => {
  test('redireciona para login sem autenticação', async ({ page }) => {
    await page.goto('/admin');
    // Middleware redireciona para /admin/login
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('página de login carrega corretamente', async ({ page }) => {
    await page.goto('/admin/login');
    // Verifica campos do formulário
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });

  test('login com credenciais inválidas mostra erro', async ({ page }) => {
    await page.goto('/admin/login');
    await page.locator('input[type="email"]').fill('fake@email.com');
    await page.locator('input[type="password"]').fill('senhaerrada123');
    await page.locator('button[type="submit"]').click();

    // Aguarda mensagem de erro
    const error = page.locator('text=inválid');
    await expect(error).toBeVisible({ timeout: 10000 });
  });

  test('rotas admin protegidas redirecionam', async ({ page }) => {
    await page.goto('/admin/series/new');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
