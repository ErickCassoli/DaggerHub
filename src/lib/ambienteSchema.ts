import { z } from 'zod';
import {
  AMBIENTE_FEATURE_KIND_VALUES,
  AMBIENTE_TIPO_VALUES,
} from '@/types/ambiente';

const featureSchema = z.object({
  id: z.string(),
  nome: z.string().min(1, 'Obrigatório'),
  tipo: z.enum(AMBIENTE_FEATURE_KIND_VALUES),
  descricao: z.string().min(1, 'Obrigatório'),
});

const adversaryRefSchema = z.object({
  id: z.string(),
  adversaryRef: z.string().min(1),
  origem: z.enum(['biblioteca', 'bestiario']),
});

export const ambienteSchema = z.object({
  id: z.string(),
  nome: z.string().min(1, 'Obrigatório').max(60),
  tipo: z.enum(AMBIENTE_TIPO_VALUES),
  patamar: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  descricao: z.string().max(280).default(''),
  impulsos: z.array(z.string().min(1)).min(1, 'Inclua ao menos 1 impulso'),
  dificuldade: z.coerce.number().int().min(1).max(30),
  potencialMedo: z
    .union([z.coerce.number().int().min(0).max(20), z.literal('').transform(() => undefined)])
    .optional(),
  adversariosSugeridos: z.array(adversaryRefSchema),
  habilidades: z.array(featureSchema),
  caracteristicas: z.array(featureSchema),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
});

export type AmbienteInput = z.input<typeof ambienteSchema>;
export type AmbienteParsed = z.output<typeof ambienteSchema>;
