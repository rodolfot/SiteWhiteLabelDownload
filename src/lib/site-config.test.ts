import { describe, it, expect } from 'vitest';
import { siteConfig } from './site-config';

describe('siteConfig', () => {
  it('tem nome definido', () => {
    expect(siteConfig.name).toBeDefined();
    expect(siteConfig.name.length).toBeGreaterThan(0);
  });

  it('tem tagline definida', () => {
    expect(siteConfig.tagline).toBeDefined();
  });

  it('tem description definida', () => {
    expect(siteConfig.description).toBeDefined();
  });

  it('tem locale definido como pt_BR', () => {
    expect(siteConfig.locale).toBe('pt_BR');
  });
});
