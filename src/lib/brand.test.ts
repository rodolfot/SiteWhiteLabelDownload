import { describe, it, expect } from 'vitest';
import { getBrandParts } from './brand';

describe('getBrandParts', () => {
  it('divide o nome padrão DownDoor corretamente', () => {
    const [first, second] = getBrandParts();
    expect(first.length).toBeGreaterThan(0);
    expect(second.length).toBeGreaterThan(0);
    expect(first + second).toContain('Down');
  });
});
