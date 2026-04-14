import type { Tipo } from '@/types/adversary';

export interface TipoInfo {
  value: Tipo;
  label: string;
  descricao: string;
}

/**
 * Tipos oficiais conforme Livro Básico de Daggerheart PT-BR
 * (Cap. 4 — Adversários e Ambientes, pp. 193–208).
 */
export const TIPOS: TipoInfo[] = [
  {
    value: 'assistente',
    label: 'Assistente',
    descricao: 'Apoia aliados e prejudica oponentes com efeitos e condições.',
  },
  {
    value: 'atirador',
    label: 'Atirador',
    descricao: 'Frágil no corpo a corpo, devasta alvos à distância.',
  },
  {
    value: 'brutamonte',
    label: 'Brutamonte',
    descricao: 'Durão, aguenta muito dano e dá golpes poderosos.',
  },
  {
    value: 'comum',
    label: 'Comum',
    descricao: 'Base dos grupos de adversários, perfil mediano.',
  },
  {
    value: 'horda',
    label: 'Horda',
    descricao: 'Criaturas agrupadas agindo como uma única unidade.',
  },
  {
    value: 'lacaio',
    label: 'Lacaio',
    descricao: 'Derrotado facilmente, perigoso em grande número.',
  },
  {
    value: 'lider',
    label: 'Líder',
    descricao: 'Comanda, fortalece e invoca outros adversários.',
  },
  {
    value: 'manipulador',
    label: 'Manipulador',
    descricao: 'Desafios sociais superados com diálogo em vez de combate.',
  },
  {
    value: 'oportunista',
    label: 'Oportunista',
    descricao: 'Explora fraquezas, emboscadas e bater-e-correr.',
  },
  {
    value: 'solo',
    label: 'Solo',
    descricao: 'Desafio formidável capaz de enfrentar o grupo sozinho.',
  },
];

export const TIPO_LABEL: Record<Tipo, string> = TIPOS.reduce(
  (acc, t) => ({ ...acc, [t.value]: t.label }),
  {} as Record<Tipo, string>,
);
