import type { Adversary } from '@/types/adversary';

/**
 * Adversárias oficiais de Hope & Fear — Daggerheart (expansão, agosto 2026).
 * Será populado via docs/parse_hope_and_fear.py após lançamento do PDF (~11/08/2026).
 * IDs prefixados com "hf:" para não colidir com "oficial:" do bestiario.ts.
 * Entradas de placeholder confirmam que o chip "H&F" e os filtros de fonte funcionam.
 * Remover os placeholders e substituir pelos dados reais quando o PDF estiver disponível.
 */
export const BESTIARIO_EXPANSAO: Adversary[] = [
  // --- PLACEHOLDERS (remover ao popular com dados reais) ---
  {
    id: 'hf:placeholder-sombra-corrompida',
    nome: 'Sombra Corrompida',
    tipo: 'comum',
    patamar: 2,
    descricao:
      'Uma silhueta escura nascida do Domínio do Terror, cujo toque drena a Esperança dos mortais. Placeholder — substituir com dados reais do livro.',
    motivacoes: ['drenar esperança', 'expandir o domínio', 'obedecer ao Senhor do Domínio'],
    dificuldade: 14,
    limiarMaior: 10,
    limiarGrave: 20,
    pv: 6,
    pf: 3,
    atq: 2,
    ataques: [
      {
        id: 'hf-sombra-atq',
        nome: 'Toque Sombrio',
        alcance: 'muito próximo',
        dano: '2d6+3 mág',
      },
    ],
    experiencias: [],
    habilidades: [
      {
        id: 'hf-sombra-hab0',
        nome: 'Drenar Esperança',
        tipo: 'acao',
        descricao:
          'Gaste 1 Ponto de Medo. Um alvo próximo perde 1 Ponto de Esperança. O Senhor do Domínio recupera 1 PF.',
      },
      {
        id: 'hf-sombra-hab1',
        nome: 'Forma Sombria',
        tipo: 'passiva',
        descricao:
          'A Sombra Corrompida não pode ser atingida por dano físico enquanto estiver no escuro.',
      },
    ],
    fonte: 'hope_and_fear',
    criadoEm: '1970-01-01T00:00:00.000Z',
    atualizadoEm: '1970-01-01T00:00:00.000Z',
  },
  {
    id: 'hf:placeholder-senhor-do-dominio',
    nome: 'Senhor do Domínio',
    tipo: 'lider',
    patamar: 3,
    descricao:
      'O soberano de um Domínio do Terror — uma entidade Transformada que torce a realidade ao seu redor. Placeholder — substituir com dados reais do livro.',
    motivacoes: [
      'expandir o Domínio',
      'aprisionar almas',
      'manter o ciclo de sofrimento',
    ],
    dificuldade: 18,
    limiarMaior: 22,
    limiarGrave: 36,
    pv: 8,
    pf: 6,
    atq: 4,
    ataques: [
      {
        id: 'hf-senhor-atq',
        nome: 'Vontade do Domínio',
        alcance: 'distante',
        dano: '2d10+3 mág',
      },
    ],
    experiencias: [{ id: 'hf-senhor-exp0', nome: 'Senhorio Absoluto', bonus: 3 }],
    habilidades: [
      {
        id: 'hf-senhor-hab0',
        nome: 'Maldição do Domínio',
        tipo: 'passiva',
        descricao:
          'Personagens que falhem com Medo dentro do Domínio perdem 1 Ponto de Esperança adicional. Esta é uma Maldição enquanto o Senhor viver.',
      },
      {
        id: 'hf-senhor-hab1',
        nome: 'Forma Sombria',
        tipo: 'reacao',
        descricao:
          'Quando o Senhor do Domínio sofrer dano grave, ele assume sua Forma Sombria, ganhando resistência a dano físico e recuperando 1d4 PF.',
      },
      {
        id: 'hf-senhor-hab2',
        nome: 'Convocar Servos',
        tipo: 'acao',
        descricao:
          'Gaste 2 Pontos de Medo para invocar 1d4 Sombras Corrompidas em pontos em alcance próximo.',
      },
    ],
    fonte: 'hope_and_fear',
    criadoEm: '1970-01-01T00:00:00.000Z',
    atualizadoEm: '1970-01-01T00:00:00.000Z',
  },
  {
    id: 'hf:placeholder-espectro-faminto',
    nome: 'Espectro Faminto',
    tipo: 'oportunista',
    patamar: 1,
    descricao:
      'O espírito de alguém que morreu consumido pelo desespero no interior de um Domínio do Terror. Placeholder — substituir com dados reais do livro.',
    motivacoes: ['devorar emoções', 'assombrar os vivos', 'buscar descanso'],
    dificuldade: 12,
    limiarMaior: 4,
    limiarGrave: 8,
    pv: 3,
    pf: 3,
    atq: 1,
    ataques: [
      {
        id: 'hf-espectro-atq',
        nome: 'Toque Gelado',
        alcance: 'corpo a corpo',
        dano: '1d4+4 mág',
      },
    ],
    experiencias: [],
    habilidades: [
      {
        id: 'hf-espectro-hab0',
        nome: 'Imaterial',
        tipo: 'passiva',
        descricao:
          'O Espectro ignora armadura. Dano físico causado a ele é reduzido à metade.',
      },
      {
        id: 'hf-espectro-hab1',
        nome: 'Sussurro do Desespero',
        tipo: 'acao',
        descricao:
          'Gaste 1 Ponto de Medo. Um alvo muito próximo deve fazer um teste de reação de Presença (12). Se falhar, perde 1 Ponto de Esperança e sofre desvantagem em seu próximo teste.',
      },
    ],
    fonte: 'hope_and_fear',
    criadoEm: '1970-01-01T00:00:00.000Z',
    atualizadoEm: '1970-01-01T00:00:00.000Z',
  },
];
