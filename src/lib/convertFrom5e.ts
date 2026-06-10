import { nanoid } from 'nanoid';
import type { Adversary, Patamar, Tipo } from '@/types/adversary';
import { getBaseline } from '@/data/baselines';

const CR_FRACTIONS: Record<string, number> = { '1/8': 0.125, '1/4': 0.25, '1/2': 0.5 };

function parseCR(text: string): number | null {
  const m = text.match(/\bChallenge\s+(\d+\/\d+|\d+)/i);
  if (!m) return null;
  // Frações fora da tabela (ex.: "3/4" em homebrew) viram NaN — trate como
  // não encontrado para o aviso correto disparar, em vez de cair no Patamar 4.
  const cr = CR_FRACTIONS[m[1]] ?? Number(m[1]);
  return Number.isFinite(cr) ? cr : null;
}

function crToPatamar(cr: number): Patamar {
  if (cr <= 4) return 1;
  if (cr <= 10) return 2;
  if (cr <= 16) return 3;
  return 4;
}

function inferTipo(text: string): Tipo {
  const lower = text.toLowerCase();
  if (/\bswarm of\b|\benxame de\b/.test(lower)) return 'horda';
  const hasLegRes = /legendary resistance/i.test(lower);
  const hasLegAct = /^\s*legendary actions\s*$/im.test(lower);
  if (hasLegRes && hasLegAct) return 'solo';
  if (hasLegAct) return 'lider';
  if (/\b(giant|golem|troll|ogre|cyclops|titan|balor|tarrasque|colossus|ettin|gorgon|juggernaut)\b/.test(lower)) return 'brutamonte';
  if (/\b(mage|wizard|sorcerer|warlock|druid|cleric|bard|illusionist|necromancer|lich|witch|enchanter|diviner)\b/.test(lower)) return 'manipulador';
  if (/\b(archer|scout|hunter|ranger|sharpshooter|crossbowman|sniper|bowman)\b/.test(lower)) return 'atirador';
  if (/\b(rogue|assassin|spy|thief|shadow|infiltrator|cutpurse|burglar)\b/.test(lower)) return 'oportunista';
  if (/\b(acolyte|cultist|priest|healer|shaman|attendant|squire)\b/.test(lower)) return 'assistente';
  return 'comum';
}

function parseAC(text: string): number | null {
  const m = text.match(/\bArmor\s*Class\s+(\d+)/i);
  return m ? Math.max(8, Math.min(21, Number(m[1]))) : null;
}

function parseHighestAttackBonus(text: string): number | null {
  const hits = [...text.matchAll(/\+(\d+)\s+to\s+hit/gi)].map((m) => Number(m[1]));
  return hits.length > 0 ? Math.max(-5, Math.min(15, Math.max(...hits))) : null;
}

function extractName(text: string): string {
  const first = text.trim().split('\n')[0]?.trim() ?? '';
  return first.slice(0, 60) || 'Adversária';
}

function extractSizeType(text: string): string {
  for (const line of text.trim().split('\n').slice(0, 6).map((l) => l.trim())) {
    if (/\b(tiny|small|medium|large|huge|gargantuan|humanoid|beast|undead|fiend|aberration|construct|dragon|fey|giant|monstrosity|ooze|plant|celestial|elemental|swarm)\b/i.test(line)) {
      return line.slice(0, 120);
    }
  }
  return '';
}

interface ParsedEntry {
  nome: string;
  descricao: string;
  isAttack: boolean;
}

function parseEntries(section: string): ParsedEntry[] {
  const results: ParsedEntry[] = [];
  let current: ParsedEntry | null = null;

  for (const rawLine of section.split('\n')) {
    const line = rawLine.trim();
    if (!line) {
      if (current) { results.push(current); current = null; }
      continue;
    }
    // An entry starts with "Name[optional (Recharge X–Y)]. Description"
    const m = line.match(/^([A-Z][A-Za-zÀ-ÿ\s'',-]{1,60}?)(?:\s*\([^)]{0,40}\))?\.\s+(.{2,})$/);
    if (m) {
      if (current) results.push(current);
      const nome = m[1].trim();
      const descricao = m[2].trim();
      current = {
        nome,
        descricao: descricao.slice(0, 400),
        isAttack: /weapon attack|attack:/i.test(descricao),
      };
    } else if (current) {
      current.descricao = `${current.descricao} ${line}`.slice(0, 400);
    }
  }
  if (current) results.push(current);
  return results.slice(0, 10);
}

function extractSection(text: string, headerRe: RegExp, nextRe: RegExp): string {
  const start = text.search(headerRe);
  if (start < 0) return '';
  const remaining = text.slice(start + 1);
  const end = remaining.search(nextRe);
  return end >= 0 ? text.slice(start, start + 1 + end) : text.slice(start);
}

function extractTraits(text: string): string {
  const actionsIdx = text.search(/^\s*Actions\s*$/im);
  const beforeActions = actionsIdx >= 0 ? text.slice(0, actionsIdx) : text;
  const challengeIdx = beforeActions.search(/\bChallenge\b/i);
  if (challengeIdx < 0) return '';
  const afterChallenge = beforeActions.slice(challengeIdx).replace(/^[^\n]*\n/m, '');
  return afterChallenge.replace(/^Proficiency Bonus[^\n]*\n?/im, '').trim();
}

export interface ConvertFrom5eResult {
  adversary: Adversary;
  warnings: string[];
}

export function convertFrom5e(rawText: string): ConvertFrom5eResult {
  const warnings: string[] = [];
  const text = rawText.trim();

  if (!text) {
    warnings.push('Nenhum texto fornecido.');
    return { adversary: buildFallback(), warnings };
  }

  const nome = extractName(text);
  const crRaw = parseCR(text);
  if (crRaw === null) {
    warnings.push('Challenge Rating não encontrado — usando Patamar 1 como padrão.');
  }
  const cr = crRaw ?? 0;
  const patamar = crToPatamar(cr);
  const tipo = inferTipo(text);
  const baseline = getBaseline(patamar, tipo);

  const dificuldade = parseAC(text) ?? baseline.dificuldade;
  const atq = parseHighestAttackBonus(text) ?? baseline.atq;

  const sizeType = extractSizeType(text);
  const crLabel = cr === 0.125 ? '1/8' : cr === 0.25 ? '1/4' : cr === 0.5 ? '1/2' : String(cr);
  const descricao = ['Convertida de D&D 5e.', sizeType, `CR ${crLabel}.`]
    .filter(Boolean)
    .join(' ');

  const SECTION_ENDS = /^\s*(Bonus Actions?|Reactions?|Legendary Actions|Mythic Actions|Lair Actions)\s*$/im;
  const actionsText = extractSection(text, /^\s*Actions\s*$/im, SECTION_ENDS);
  const traitText = extractTraits(text);

  const actionEntries = parseEntries(actionsText).filter(
    (e) => e.nome.toLowerCase() !== 'actions',
  );
  const traitEntries = parseEntries(traitText);

  const attackEntries = actionEntries.filter((e) => e.isAttack);
  const nonAttackEntries = actionEntries.filter((e) => !e.isAttack);

  const ataques =
    attackEntries.length > 0
      ? attackEntries.slice(0, 5).map((a) => ({
          id: nanoid(8),
          nome: a.nome,
          alcance: /ranged/i.test(a.descricao) ? 'À distância' : 'Corpo a corpo',
          dano: baseline.danoSugerido,
        }))
      : [{ id: nanoid(8), nome: 'Ataque', alcance: 'Corpo a corpo', dano: baseline.danoSugerido }];

  const habilidades = [
    ...traitEntries.slice(0, 4).map((t) => ({
      id: nanoid(8),
      nome: t.nome,
      tipo: 'passiva' as const,
      descricao: t.descricao,
    })),
    ...nonAttackEntries.slice(0, 3).map((a) => ({
      id: nanoid(8),
      nome: a.nome,
      tipo: 'acao' as const,
      descricao: a.descricao,
    })),
  ].slice(0, 6);

  warnings.push(
    'Limiares, PV e dano foram baseados nos padrões Daggerheart para o tipo/patamar inferido — revise antes de salvar.',
  );

  const now = new Date().toISOString();
  return {
    adversary: {
      id: nanoid(10),
      nome,
      tipo,
      patamar,
      descricao,
      // O schema exige ao menos 1 motivação; placeholder até o usuário revisar.
      motivacoes: ['a definir'],
      dificuldade,
      limiarMaior: baseline.limiarMaior,
      limiarGrave: baseline.limiarGrave,
      pv: baseline.pv,
      pf: baseline.pf,
      atq,
      hordaRatio: tipo === 'horda' ? '1/PV' : undefined,
      ataques,
      experiencias: [],
      habilidades,
      criadoEm: now,
      atualizadoEm: now,
    },
    warnings,
  };
}

function buildFallback(): Adversary {
  const now = new Date().toISOString();
  const baseline = getBaseline(1, 'comum');
  return {
    id: nanoid(10),
    nome: 'Adversária (5e)',
    tipo: 'comum',
    patamar: 1,
    descricao: '',
    motivacoes: ['a definir'],
    dificuldade: baseline.dificuldade,
    limiarMaior: baseline.limiarMaior,
    limiarGrave: baseline.limiarGrave,
    pv: baseline.pv,
    pf: baseline.pf,
    atq: baseline.atq,
    ataques: [{ id: nanoid(8), nome: 'Ataque', alcance: 'Corpo a corpo', dano: baseline.danoSugerido }],
    experiencias: [],
    habilidades: [],
    criadoEm: now,
    atualizadoEm: now,
  };
}
