import type { AmbienteFeature, AmbienteFeatureKind } from '@/types/ambiente';
import { renderKeywords } from '@/components/StatsBlock/renderKeywords';

const FEATURE_LABEL: Record<AmbienteFeatureKind, string> = {
  acao: 'ação',
  reacao: 'reação',
  passiva: 'passiva',
  medo: 'medo',
};

export function FeatureItem({ feature }: { feature: AmbienteFeature }) {
  return (
    <p className="my-[8px] text-[0.9rem] leading-[1.5]">
      <span className="text-[0.7rem] text-[#a3802e]">◆ </span>
      <strong className="font-extrabold">{feature.nome}</strong>
      <em className="text-[#a3802e]"> ({FEATURE_LABEL[feature.tipo]})</em>:{' '}
      {renderKeywords(feature.descricao)}
    </p>
  );
}
