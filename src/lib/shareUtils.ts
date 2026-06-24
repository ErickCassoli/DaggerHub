import type { Adversary } from '@/types/adversary';

/** Codifica adversária em base64 URL-safe (UTF-8 seguro). */
export function encodeAdversaryPayload(adv: Adversary): string {
  const json = JSON.stringify(adv);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Decodifica payload de URL; retorna null em caso de erro. */
export function decodeAdversaryPayload(encoded: string): unknown {
  try {
    const standard = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = standard + '='.repeat((4 - (standard.length % 4)) % 4);
    const binaryStr = atob(padded);
    const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

/** Constrói URL de compartilhamento para a adversária. */
export function buildAdversaryShareUrl(adv: Adversary): string {
  const encoded = encodeAdversaryPayload(adv);
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/share?adv=${encoded}`;
}
