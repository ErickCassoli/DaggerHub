/**
 * Palavras-chave do sistema Daggerheart (pt-BR).
 * Usadas nos chips que inserem **Keyword** no caret do textarea de descrição
 * e para destacar em negrito no preview via renderKeywords().
 */
export const KEYWORDS = [
  'Ação',
  'Reação',
  'Passiva',
  'Corpo a corpo',
  'Próximo',
  'Distante',
  'Longe',
  'Muito longe',
  'Vulnerável',
  'Oculto',
  'Restringido',
  'Inconsciente',
  'Ponto de Medo',
  'Ponto de Esperança',
  'Estresse',
  'Fadiga',
  'Engajamento',
  'Físico',
  'Mágico',
] as const;

export type Keyword = (typeof KEYWORDS)[number];
