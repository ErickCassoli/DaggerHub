import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { TIPO_LABEL } from '@/data/tipos';
import { PATAMAR_LABEL } from '@/data/patamares';
import { convertFrom5e, type ConvertFrom5eResult } from '@/lib/convertFrom5e';
import type { Adversary } from '@/types/adversary';

interface ConvertFrom5eModalProps {
  open: boolean;
  onClose: () => void;
  onConvert: (adversary: Adversary) => void;
}

export function ConvertFrom5eModal({ open, onClose, onConvert }: ConvertFrom5eModalProps) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<ConvertFrom5eResult | null>(null);

  if (!open) return null;

  const handleClose = () => {
    onClose();
    setText('');
    setPreview(null);
  };

  const handlePreview = () => {
    setPreview(convertFrom5e(text));
  };

  const handleConvert = () => {
    if (!preview) return;
    onConvert(preview.adversary);
    setText('');
    setPreview(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-2 sm:p-4"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[calc(100vh-1rem)] w-full max-w-2xl flex-col rounded-md border border-ink/30 bg-parchment shadow-xl sm:max-h-[min(90vh,780px)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-ink/20 px-4 py-3">
          <h2 className="font-display text-lg uppercase tracking-wide text-ink">
            Converter de D&amp;D 5e
          </h2>
          <Button size="sm" variant="ghost" onClick={handleClose} aria-label="Fechar">
            ✕
          </Button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <p className="text-sm text-ink/70">
            Cole um stat block de D&amp;D 5e (do D&amp;D Beyond, SRD ou PDF). Os campos serão
            pré-preenchidos automaticamente.{' '}
            <strong>Revise todos os valores no editor</strong> antes de salvar — dano, limiares
            e PV usam os padrões Daggerheart para o tipo/patamar inferido, não a escala de 5e.
          </p>

          <Textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setPreview(null);
            }}
            rows={10}
            placeholder={
              'Goblin\nSmall humanoid (goblinoid), neutral evil\n\nArmor Class 15\nHit Points 7 (2d6)\n...\nChallenge 1/4 (50 XP)\n\nNimble Escape. The goblin can take the Disengage...\n\nActions\nScimitar. Melee Weapon Attack: +4 to hit...'
            }
            className="font-mono text-xs"
          />

          {preview !== null && (
            <div className="rounded border border-ink/20 bg-white/30 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/60">
                Prévia da conversão
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink/50">
                    Nome
                  </dt>
                  <dd className="font-semibold text-ink">{preview.adversary.nome}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink/50">
                    Tipo
                  </dt>
                  <dd className="text-ink">{TIPO_LABEL[preview.adversary.tipo]}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink/50">
                    Patamar
                  </dt>
                  <dd className="text-ink">{PATAMAR_LABEL[preview.adversary.patamar]}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink/50">
                    Dificuldade
                  </dt>
                  <dd className="text-ink">{preview.adversary.dificuldade}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink/50">
                    ATQ
                  </dt>
                  <dd className="text-ink">
                    {preview.adversary.atq >= 0 ? '+' : ''}
                    {preview.adversary.atq}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink/50">
                    PV / PF
                  </dt>
                  <dd className="text-ink">
                    {preview.adversary.pv} / {preview.adversary.pf}
                  </dd>
                </div>
                {preview.adversary.ataques.length > 0 && (
                  <div className="col-span-2 sm:col-span-3">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink/50">
                      Ataques detectados
                    </dt>
                    <dd className="text-ink">
                      {preview.adversary.ataques.map((a) => a.nome).join(', ')}
                    </dd>
                  </div>
                )}
                {preview.adversary.habilidades.length > 0 && (
                  <div className="col-span-2 sm:col-span-3">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink/50">
                      Habilidades detectadas
                    </dt>
                    <dd className="text-ink">
                      {preview.adversary.habilidades.map((h) => h.nome).join(', ')}
                    </dd>
                  </div>
                )}
              </dl>
              {preview.warnings.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {preview.warnings.map((w, i) => (
                    <li key={i} className="text-xs text-amber-800">
                      ⚠ {w}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-ink/20 px-4 py-3">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          {preview === null ? (
            <Button variant="primary" onClick={handlePreview} disabled={!text.trim()}>
              Pré-visualizar
            </Button>
          ) : (
            <Button variant="primary" onClick={handleConvert}>
              Converter e abrir editor →
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}
