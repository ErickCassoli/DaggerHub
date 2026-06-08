import { z } from 'zod';
import { TRANSFORMACAO_ABILITY_KIND_VALUES } from '@/types/transformacao';

const abilitySchema = z.object({
  id: z.string(),
  nome: z.string().min(1, 'Obrigatório'),
  tipo: z.enum(TRANSFORMACAO_ABILITY_KIND_VALUES),
  descricao: z.string().min(1, 'Obrigatório'),
});

const formaAlternativaSchema = z.object({
  nome: z.string().min(1, 'Obrigatório'),
  descricao: z.string().min(1, 'Obrigatório'),
});

const tokensSchema = z.object({
  nome: z.string().min(1, 'Obrigatório'),
  maximo: z.coerce.number().int().min(1, 'Mínimo 1').max(20, 'Máximo 20'),
  descricao: z.string().min(1, 'Obrigatório'),
});

export const transformacaoSchema = z.object({
  id: z.string(),
  nome: z.string().min(1, 'Obrigatório').max(60),
  descricao: z.string().max(500).default(''),
  formaAlternativa: formaAlternativaSchema.optional(),
  habilidades: z.array(abilitySchema),
  tokens: tokensSchema.optional(),
  notas: z.string().max(1000).default(''),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
});

export type TransformacaoInput = z.input<typeof transformacaoSchema>;
export type TransformacaoParsed = z.output<typeof transformacaoSchema>;
