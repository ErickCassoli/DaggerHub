import type { Tipo } from '@/types/adversary';

export interface TipoInfo {
  value: Tipo;
  label: string;
  descricao: string;
}

export const TIPOS: TipoInfo[] = [
  {
    value: 'brutamontes',
    label: 'Brutamontes',
    descricao: 'Adversária poderosa em combate corpo a corpo, com alta resistência.',
  },
  {
    value: 'horda',
    label: 'Horda',
    descricao: 'Grupo de adversárias fracas que atuam como uma única criatura.',
  },
  {
    value: 'lider',
    label: 'Líder',
    descricao: 'Comanda outras adversárias e oferece apoio em combate.',
  },
  {
    value: 'lacaio',
    label: 'Lacaio',
    descricao: 'Adversária simples, em grandes números, cai rápido.',
  },
  {
    value: 'distancia',
    label: 'À Distância',
    descricao: 'Especialista em ataques à distância e manter inimigos afastados.',
  },
  {
    value: 'furtivo',
    label: 'Furtivo',
    descricao: 'Age nas sombras, emboscadas e mobilidade.',
  },
  {
    value: 'manipulador',
    label: 'Manipulador',
    descricao: 'Foco em intrigas, enganação e influência social.',
  },
  {
    value: 'solo',
    label: 'Solo',
    descricao: 'Encontro isolado, capaz de enfrentar um grupo inteiro.',
  },
  {
    value: 'padrao',
    label: 'Padrão',
    descricao: 'Adversária de perfil balanceado, sem especialização forte.',
  },
  {
    value: 'suporte',
    label: 'Suporte',
    descricao: 'Reforça aliados, com efeitos de área e utilidade.',
  },
];

export const TIPO_LABEL: Record<Tipo, string> = TIPOS.reduce(
  (acc, t) => ({ ...acc, [t.value]: t.label }),
  {} as Record<Tipo, string>,
);
