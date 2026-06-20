/**
 * Palavras-chave do sistema Daggerheart (pt-BR), alinhadas ao
 * Livro Básico (Cap. 4, pp. 193–208).
 * Usadas nos chips que inserem **Keyword** no caret do textarea de descrição
 * e para destacar em negrito no preview via renderKeywords().
 */
export const KEYWORDS = [
  // Ações
  'Ação',
  'Reação',
  'Passiva',
  // Alcances
  'Corpo a corpo',
  'Muito próximo',
  'Próximo',
  'Distante',
  'Muito distante',
  // Condições
  'Vulnerável',
  'Imobilizado',
  'Escondido',
  'Protegido',
  'Inconsciente',
  // Recursos
  'Ponto de Medo',
  'Ponto de Esperança',
  'Ponto de Fadiga',
  'Ponto de Vida',
  'Ponto de Armadura',
  // Modificadores
  'Vantagem',
  'Desvantagem',
  'Contagem',
  'Marcador',
  // Dano
  'Físico',
  'Mágico',
  'Direto',
  // Hope & Fear — Domínios do Terror e Transformações (provisório, confirmar com PDF ~ago/2026)
  'Maldição',
  'Transformado',
  'Forma Sombria',
  'Forma Animal',
  'Dread',
  'Domínio',
  'Esperança Corrompida',
  'Espírito',
] as const;

export type Keyword = (typeof KEYWORDS)[number];
