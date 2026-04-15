import { Input } from '@/components/ui/Input';
import { Section } from '@/components/ui/Section';
import { ADJUSTMENTS } from '@/data/encounterRules';
import type {
  EncounterAdjustmentKey,
  EncounterPartyConfig,
} from '@/types/encounter';

interface PartyConfigProps {
  party: EncounterPartyConfig;
  ajustes: EncounterAdjustmentKey[];
  onPartyChange: (next: EncounterPartyConfig) => void;
  onAjustesChange: (next: EncounterAdjustmentKey[]) => void;
}

export function PartyConfig({ party, ajustes, onPartyChange, onAjustesChange }: PartyConfigProps) {
  const toggle = (key: EncounterAdjustmentKey, checked: boolean) => {
    if (checked) onAjustesChange([...ajustes, key]);
    else onAjustesChange(ajustes.filter((k) => k !== key));
  };

  return (
    <Section
      title="Grupo de personagens"
      subtitle="Base do orçamento conforme p.197"
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="field-label">Nº de PCs</span>
          <Input
            type="number"
            min={1}
            max={8}
            value={party.numPC}
            onChange={(e) => onPartyChange({ ...party, numPC: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="block">
          <span className="field-label">Nível médio</span>
          <Input
            type="number"
            min={1}
            max={10}
            value={party.nivelPC}
            onChange={(e) => onPartyChange({ ...party, nivelPC: Number(e.target.value) || 1 })}
          />
        </label>
      </div>

      <fieldset className="mt-2">
        <legend className="field-label mb-2">Ajustes de dificuldade</legend>
        <ul className="space-y-1">
          {ADJUSTMENTS.map((a) => {
            const checked = ajustes.includes(a.key);
            return (
              <li key={a.key}>
                <label className="flex items-start gap-2 rounded px-2 py-1 hover:bg-ink/5">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checked}
                    onChange={(e) => toggle(a.key, e.target.checked)}
                  />
                  <span className="flex-1">
                    <span className="text-sm text-ink">
                      {a.label}
                      <span className="ml-1 text-xs text-ink/60">
                        ({a.delta > 0 ? `+${a.delta}` : a.delta})
                      </span>
                    </span>
                    <span className="block text-xs text-ink/60">{a.descricao}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </Section>
  );
}
