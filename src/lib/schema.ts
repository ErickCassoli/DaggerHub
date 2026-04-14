import { z } from 'zod';
import { ABILITY_KIND_VALUES, TIPO_VALUES } from '@/types/adversary';

/** Formato aceito: "1d8+2 fís", "2d6 mág", "3d10-1 fís". */
export const danoRegex = /^\d+d\d+([+-]\d+)?\s+(fís|mág)$/i;

export const attackSchema = z.object({
  id: z.string(),
  nome: z.string().min(1, 'Obrigatório'),
  alcance: z.string().min(1, 'Obrigatório'),
  dano: z.string().regex(danoRegex, 'Formato esperado: 1d8+2 fís'),
});

export const experienceSchema = z.object({
  id: z.string(),
  nome: z.string().min(1, 'Obrigatório'),
  bonus: z.coerce.number().int().min(-5).max(15),
});

export const abilitySchema = z.object({
  id: z.string(),
  nome: z.string().min(1, 'Obrigatório'),
  tipo: z.enum(ABILITY_KIND_VALUES),
  descricao: z.string().min(1, 'Obrigatório'),
});

export const adversarySchema = z
  .object({
    id: z.string(),
    nome: z.string().min(1, 'Obrigatório').max(60),
    tipo: z.enum(TIPO_VALUES),
    patamar: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    descricao: z.string().max(240).default(''),
    motivacoes: z.array(z.string().min(1)).min(1, 'Inclua ao menos 1 motivação'),
    dificuldade: z.coerce.number().int().min(1).max(30),
    limiarMaior: z.coerce.number().int().min(1),
    limiarGrave: z.coerce.number().int().min(1),
    pv: z.coerce.number().int().min(0).max(30),
    pf: z.coerce.number().int().min(0).max(20),
    atq: z.coerce.number().int().min(-5).max(15),
    ataques: z.array(attackSchema).min(1, 'Inclua ao menos 1 ataque'),
    experiencias: z.array(experienceSchema),
    habilidades: z.array(abilitySchema),
    criadoEm: z.string(),
    atualizadoEm: z.string(),
  })
  .refine((d) => d.limiarGrave > d.limiarMaior, {
    path: ['limiarGrave'],
    message: 'Grave deve ser maior que Maior',
  });

export type AdversaryInput = z.input<typeof adversarySchema>;
export type AdversaryParsed = z.output<typeof adversarySchema>;
