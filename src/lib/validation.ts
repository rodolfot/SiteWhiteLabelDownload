/** Valida que a URL usa protocolo http: ou https: */
export function isValidDownloadUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

const ALLOWED_TRAILER_HOSTS = [
  'youtube.com', 'www.youtube.com', 'youtu.be',
  'twitch.tv', 'www.twitch.tv',
  'kick.com', 'www.kick.com',
] as const;

/** Valida que a URL de trailer pertence a um domínio permitido (YouTube, Twitch, Kick) */
export function isValidTrailerUrl(url: string): boolean {
  if (!url) return true; // trailer é opcional
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    return ALLOWED_TRAILER_HOSTS.some(
      host => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/** Valida magic bytes do arquivo para confirmar tipo real */
async function validateImageMagicBytes(file: File): Promise<boolean> {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return true;
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return true;

  return false;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  ext?: string;
}

/** Valida MIME type, tamanho e magic bytes de uma imagem antes do upload */
export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    return { valid: false, error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.' };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Arquivo muito grande. Máximo 5MB.' };
  }

  const validMagic = await validateImageMagicBytes(file);
  if (!validMagic) {
    return { valid: false, error: 'Arquivo corrompido ou tipo inválido.' };
  }

  const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
  return { valid: true, ext };
}
