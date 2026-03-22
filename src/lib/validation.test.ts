import { describe, it, expect } from 'vitest';
import { isValidDownloadUrl, isValidTrailerUrl } from './validation';

describe('isValidDownloadUrl', () => {
  it('aceita URLs http validas', () => {
    expect(isValidDownloadUrl('http://example.com/file.zip')).toBe(true);
  });

  it('aceita URLs https validas', () => {
    expect(isValidDownloadUrl('https://cdn.example.com/download/file.mkv')).toBe(true);
  });

  it('rejeita URLs sem protocolo', () => {
    expect(isValidDownloadUrl('example.com/file.zip')).toBe(false);
  });

  it('rejeita javascript: URLs', () => {
    expect(isValidDownloadUrl('javascript:alert(1)')).toBe(false);
  });

  it('rejeita data: URLs', () => {
    expect(isValidDownloadUrl('data:text/html,<h1>xss</h1>')).toBe(false);
  });

  it('rejeita URLs vazias', () => {
    expect(isValidDownloadUrl('')).toBe(false);
  });

  it('rejeita ftp: URLs', () => {
    expect(isValidDownloadUrl('ftp://files.example.com/file.zip')).toBe(false);
  });
});

describe('isValidTrailerUrl', () => {
  it('aceita URLs do YouTube', () => {
    expect(isValidTrailerUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
  });

  it('aceita URLs do YouTube embed', () => {
    expect(isValidTrailerUrl('https://youtube.com/embed/dQw4w9WgXcQ')).toBe(true);
  });

  it('aceita URLs do Twitch', () => {
    expect(isValidTrailerUrl('https://player.twitch.tv/?channel=test')).toBe(true);
  });

  it('aceita URLs do Kick', () => {
    expect(isValidTrailerUrl('https://kick.com/test')).toBe(true);
  });

  it('aceita URL vazia (trailer e opcional)', () => {
    expect(isValidTrailerUrl('')).toBe(true);
  });

  it('rejeita URLs de outros dominios', () => {
    expect(isValidTrailerUrl('https://vimeo.com/123456')).toBe(false);
  });

  it('rejeita URLs javascript', () => {
    expect(isValidTrailerUrl('javascript:alert(1)')).toBe(false);
  });

  it('rejeita dominios que contem youtube mas nao sao youtube', () => {
    expect(isValidTrailerUrl('https://notyoutube.com/watch')).toBe(false);
  });
});
