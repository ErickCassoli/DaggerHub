import type { Adversary } from '@/types/adversary';
import type { Ambiente } from '@/types/ambiente';
import type { Transformacao } from '@/types/transformacao';

/** Codifica um payload JSON em base64 URL-safe (UTF-8 seguro). */
function encodePayload(data: unknown): string {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Decodifica payload de URL; retorna null em caso de erro. */
export function decodePayload(encoded: string): unknown {
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

function buildShareUrl(param: string, data: unknown): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/share?${param}=${encodePayload(data)}`;
}

/** Constrói URL de compartilhamento para a adversária. */
export function buildAdversaryShareUrl(adv: Adversary): string {
  return buildShareUrl('adv', adv);
}

/** Constrói URL de compartilhamento para o ambiente. */
export function buildAmbienteShareUrl(amb: Ambiente): string {
  return buildShareUrl('amb', amb);
}

/** Constrói URL de compartilhamento para a transformação. */
export function buildTransformacaoShareUrl(tra: Transformacao): string {
  return buildShareUrl('tra', tra);
}
