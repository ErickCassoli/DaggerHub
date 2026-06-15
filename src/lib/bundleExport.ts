import { nanoid } from 'nanoid';
import type { Adversary } from '@/types/adversary';
import type { Encounter } from '@/types/encounter';
import type { Ambiente } from '@/types/ambiente';
import type { Transformacao } from '@/types/transformacao';
import { adversarySchema } from '@/lib/schema';
import { ambienteSchema } from '@/lib/ambienteSchema';
import { transformacaoSchema } from '@/lib/transformacaoSchema';
import { loadStore } from '@/lib/storage';
import { loadEncounters } from '@/lib/encounterStorage';
import { loadAmbientes } from '@/lib/ambienteStorage';
import { loadTransformacoes } from '@/lib/transformacaoStorage';
import { slugify } from '@/lib/slug';
import { downloadBlob } from '@/lib/exportUtils';

export interface DaggerHubBundle {
  version: 1;
  geradoEm: string;
  adversarias: Adversary[];
  encontros: Encounter[];
  ambientes: Ambiente[];
  transformacoes: Transformacao[];
}

export type BundleImportResult =
  | {
      ok: true;
      adversarias: Adversary[];
      encontros: Encounter[];
      ambientes: Ambiente[];
      transformacoes: Transformacao[];
      /** Itens que falharam na validação e foram ignorados. */
      descartados: number;
    }
  | { ok: false; error: string };

export function exportBundle(): void {
  const adversarias = loadStore().items;
  const encontros = loadEncounters().items;
  const ambientes = loadAmbientes().items;
  const transformacoes = loadTransformacoes().items;

  const bundle: DaggerHubBundle = {
    version: 1,
    geradoEm: new Date().toISOString(),
    adversarias,
    encontros,
    ambientes,
    transformacoes,
  };

  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const date = new Date().toISOString().slice(0, 10);
  downloadBlob(blob, `daggerhub-${slugify(date)}.json`);
}

function isEncounterLike(v: unknown): v is Encounter {
  if (!v || typeof v !== 'object') return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['id'] === 'string' &&
    typeof obj['nome'] === 'string' &&
    Array.isArray(obj['entries']) &&
    obj['party'] !== null &&
    typeof obj['party'] === 'object'
  );
}

export async function parseBundleImport(file: File): Promise<BundleImportResult> {
  let raw: unknown;
  try {
    raw = JSON.parse(await file.text());
  } catch {
    return { ok: false, error: 'Arquivo não é um JSON válido.' };
  }

  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'Arquivo inválido: não é um objeto.' };
  }

  const obj = raw as Record<string, unknown>;
  if (obj['version'] !== 1) {
    return { ok: false, error: 'Versão de bundle não suportada.' };
  }

  const rawAdversarias: unknown[] = Array.isArray(obj['adversarias']) ? obj['adversarias'] : [];
  const rawEncontros: unknown[] = Array.isArray(obj['encontros']) ? obj['encontros'] : [];
  const rawAmbientes: unknown[] = Array.isArray(obj['ambientes']) ? obj['ambientes'] : [];
  // Bundles criados antes de transformações existirem não têm esse campo — default []
  const rawTransformacoes: unknown[] = Array.isArray(obj['transformacoes']) ? obj['transformacoes'] : [];

  if (
    rawAdversarias.length === 0 &&
    rawEncontros.length === 0 &&
    rawAmbientes.length === 0 &&
    rawTransformacoes.length === 0
  ) {
    return {
      ok: false,
      error: 'Bundle vazio — nenhuma adversária, encontro, ambiente ou transformação encontrado.',
    };
  }

  // 1. Validate adversaries; track ID remapping for collision handling
  const existingIds = new Set(loadStore().items.map((i) => i.id));
  const idMap = new Map<string, string>(); // oldId → newId
  const adversarias: Adversary[] = [];

  for (const item of rawAdversarias) {
    const parsed = adversarySchema.safeParse(item);
    if (!parsed.success) continue;
    const adv = parsed.data as Adversary;
    const newId = existingIds.has(adv.id) ? nanoid(10) : adv.id;
    idMap.set(adv.id, newId);
    existingIds.add(newId);
    adversarias.push({ ...adv, id: newId });
  }

  // 2. Encounters — basic shape check; remap biblioteca refs
  const existingEncounterIds = new Set(loadEncounters().items.map((i) => i.id));
  const encontros: Encounter[] = [];

  for (const item of rawEncontros) {
    if (!isEncounterLike(item)) continue;
    const enc = item as Encounter;
    const newId = existingEncounterIds.has(enc.id) ? nanoid(10) : enc.id;
    existingEncounterIds.add(newId);
    const entries = enc.entries.map((e) => ({
      ...e,
      adversaryRef:
        e.origem === 'biblioteca' && idMap.has(e.adversaryRef)
          ? (idMap.get(e.adversaryRef) as string)
          : e.adversaryRef,
    }));
    encontros.push({ ...enc, id: newId, entries });
  }

  // 3. Ambientes — validate with schema; remap biblioteca refs
  const existingAmbienteIds = new Set(loadAmbientes().items.map((i) => i.id));
  const ambientes: Ambiente[] = [];

  for (const item of rawAmbientes) {
    const parsed = ambienteSchema.safeParse(item);
    if (!parsed.success) continue;
    const amb = parsed.data as Ambiente;
    const newId = existingAmbienteIds.has(amb.id) ? nanoid(10) : amb.id;
    existingAmbienteIds.add(newId);
    const adversariosSugeridos = amb.adversariosSugeridos.map((ref) => ({
      ...ref,
      adversaryRef:
        ref.origem === 'biblioteca' && idMap.has(ref.adversaryRef)
          ? (idMap.get(ref.adversaryRef) as string)
          : ref.adversaryRef,
    }));
    ambientes.push({ ...amb, id: newId, adversariosSugeridos });
  }

  // 4. Transformações — validate with schema
  const existingTransformacaoIds = new Set(loadTransformacoes().items.map((i) => i.id));
  const transformacoes: Transformacao[] = [];

  for (const item of rawTransformacoes) {
    const parsed = transformacaoSchema.safeParse(item);
    if (!parsed.success) continue;
    const t = parsed.data as Transformacao;
    const newId = existingTransformacaoIds.has(t.id) ? nanoid(10) : t.id;
    existingTransformacaoIds.add(newId);
    transformacoes.push({ ...t, id: newId });
  }

  const descartados =
    rawAdversarias.length - adversarias.length +
    (rawEncontros.length - encontros.length) +
    (rawAmbientes.length - ambientes.length) +
    (rawTransformacoes.length - transformacoes.length);

  return { ok: true, adversarias, encontros, ambientes, transformacoes, descartados };
}
