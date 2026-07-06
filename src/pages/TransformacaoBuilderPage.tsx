import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Transformacao } from '@/types/transformacao';
import { TRANSFORMACAO_ABILITY_KIND_VALUES } from '@/types/transformacao';
import { transformacaoSchema } from '@/lib/transformacaoSchema';
import { blankTransformacao, blankTransformacaoAbility } from '@/lib/transformacaoDefaults';
import { useTransformacaoLibrary } from '@/hooks/useTransformacaoLibrary';
import { TransformacaoBlock } from '@/components/TransformacaoBlock';
import { FitBlock } from '@/components/StatsBlock/FitBlock';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Section } from '@/components/ui/Section';
import { AppHeader } from '@/components/nav/AppHeader';
import { FieldError } from '@/components/form/FieldError';
import { KeywordChips } from '@/components/form/KeywordChips';
import { useKeyboardSave } from '@/hooks/useKeyboardSave';
import {
  exportTransformacaoJson,
  exportTransformacaoPdf,
  exportTransformacaoPng,
} from '@/lib/transformacaoExport';

const KIND_LABEL: Record<(typeof TRANSFORMACAO_ABILITY_KIND_VALUES)[number], string> = {
  acao: 'Ação',
  reacao: 'Reação',
  passiva: 'Passiva',
  gatilho: 'Gatilho',
};

export function TransformacaoBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { get, upsert } = useTransformacaoLibrary();

  const initial = useMemo<Transformacao>(() => {
    if (id) {
      const found = get(id);
      if (found) return found;
    }
    return blankTransformacao();
  }, [id, get]);

  useEffect(() => {
    if (id && !get(id)) {
      navigate('/transformacoes', { replace: true });
    }
  }, [id, get, navigate]);

  const form = useForm<Transformacao>({
    resolver: zodResolver(transformacaoSchema) as never,
    mode: 'onBlur',
    defaultValues: initial,
  });

  const { fields: habilidades, append: appendHabilidade, remove: removeHabilidade } = useFieldArray({
    control: form.control,
    name: 'habilidades',
  });

  const [hasForma, setHasForma] = useState(() => !!initial.formaAlternativa);
  const [hasTokens, setHasTokens] = useState(() => !!initial.tokens);
  const [lastSavedId, setLastSavedId] = useState<string | null>(id ?? null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const preview = form.watch();
  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const toggleForma = () => {
    if (hasForma) {
      form.setValue('formaAlternativa', undefined);
      setHasForma(false);
    } else {
      form.setValue('formaAlternativa', { nome: '', descricao: '' });
      setHasForma(true);
    }
  };

  const toggleTokens = () => {
    if (hasTokens) {
      form.setValue('tokens', undefined);
      setHasTokens(false);
    } else {
      form.setValue('tokens', { nome: '', maximo: 3, descricao: '' });
      setHasTokens(true);
    }
  };

  const onSubmit = (data: Transformacao) => {
    setSaveError(null);
    const saved = upsert(data);
    setLastSavedId(saved.id);
    // Marca o form como "limpo" para o banner de confirmação reaparecer.
    form.reset(saved);
    if (!id) {
      navigate(`/transformacoes/edit/${saved.id}`, { replace: true });
    }
  };

  const onInvalid = useCallback(() => {
    setSaveError('Não foi possível salvar — corrija os campos destacados.');
    const firstError = document.querySelector<HTMLElement>(
      '#transformacao-form [aria-invalid="true"], #transformacao-form .border-red-600',
    );
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus?.();
    }
  }, []);

  useKeyboardSave(() => form.handleSubmit(onSubmit, onInvalid)());

  const exportTargetNode = () => exportRef.current ?? previewRef.current;

  const doExportPng = async () => {
    const node = exportTargetNode();
    if (!node) return;
    try {
      setExporting('png');
      await exportTransformacaoPng(node, preview.nome || 'transformacao');
    } finally {
      setExporting(null);
    }
  };

  const doExportPdf = async () => {
    const node = exportTargetNode();
    if (!node) return;
    try {
      setExporting('pdf');
      await exportTransformacaoPdf(node, preview.nome || 'transformacao');
    } finally {
      setExporting(null);
    }
  };

  const errors = form.formState.errors;

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <AppHeader
        subtitle={id ? 'Editar transformação' : 'Nova transformação'}
        actions={
          <>
            <Link to="/transformacoes" className="text-sm text-ink/70 underline">
              ← Transformações
            </Link>
            <Button type="submit" form="transformacao-form" variant="primary" title="Salvar (Ctrl+S)">Salvar</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={doExportPng}
              disabled={!!exporting}
              title="Baixa o bloco como imagem PNG — ideal para compartilhar no Discord ou usar em VTTs"
            >
              {exporting === 'png' ? 'Exportando…' : 'PNG'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={doExportPdf}
              disabled={!!exporting}
              title="Baixa o bloco como PDF pronto para impressão"
            >
              {exporting === 'pdf' ? 'Exportando…' : 'PDF'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => exportTransformacaoJson(preview)}
              title="Baixa os dados em JSON — serve de backup e pode ser importado em outro navegador"
            >
              JSON
            </Button>
          </>
        }
      />

      {lastSavedId && !form.formState.isDirty ? (
        <p className="mb-3 rounded border border-green-800/30 bg-green-50 px-3 py-2 text-sm text-green-900 dark:border-green-700/30 dark:bg-green-950 dark:text-green-200">
          Salvo no navegador (localStorage).
        </p>
      ) : null}
      {saveError ? (
        <p className="mb-3 rounded border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-700/30 dark:bg-red-950 dark:text-red-400">
          {saveError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_460px]">
        {/* Formulário */}
        <form
          id="transformacao-form"
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="space-y-4"
        >
          {/* Identidade */}
          <Section title="Identidade">
            <div>
              <label className="field-label">Nome</label>
              <Input
                {...form.register('nome')}
                placeholder="Ex.: Vampiro, Lobisomem, Fantasma"
                aria-invalid={!!errors.nome}
              />
              <FieldError message={errors.nome?.message} />
            </div>
            <div>
              <label className="field-label">Descrição</label>
              <Textarea
                rows={3}
                {...form.register('descricao')}
                placeholder="Breve descrição da transformação e seu impacto no personagem."
              />
              <FieldError message={errors.descricao?.message} />
            </div>
          </Section>

          {/* Sistema de Tokens */}
          <Section
            title="Sistema de Tokens"
            subtitle="Recurso próprio da transformação (ex.: Dado do Lobo, Pontos de Assombro)"
            actions={
              <Button type="button" variant={hasTokens ? 'ghost' : 'secondary'} size="sm" onClick={toggleTokens}>
                {hasTokens ? 'Remover' : 'Adicionar'}
              </Button>
            }
          >
            {hasTokens ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px]">
                  <div>
                    <label className="field-label">Nome do token</label>
                    <Input
                      {...form.register('tokens.nome')}
                      placeholder="Ex.: Dado do Lobo, Pontos de Assombro"
                    />
                    <FieldError message={(errors.tokens as { nome?: { message?: string } })?.nome?.message} />
                  </div>
                  <div>
                    <label className="field-label">Máximo</label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      {...form.register('tokens.maximo')}
                    />
                    <FieldError message={(errors.tokens as { maximo?: { message?: string } })?.maximo?.message} />
                  </div>
                </div>
                <div>
                  <label className="field-label">Como funciona</label>
                  <Textarea
                    rows={3}
                    {...form.register('tokens.descricao')}
                    placeholder="Descreva como ganhar, gastar e perder os tokens."
                  />
                  <FieldError message={(errors.tokens as { descricao?: { message?: string } })?.descricao?.message} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink/60">
                Clique em "Adicionar" para incluir um sistema de tokens ou recursos.
              </p>
            )}
          </Section>

          {/* Forma Alternativa */}
          <Section
            title="Forma Alternativa"
            subtitle="Forma de lobo, forma espectral, metamorfose, etc."
            actions={
              <Button type="button" variant={hasForma ? 'ghost' : 'secondary'} size="sm" onClick={toggleForma}>
                {hasForma ? 'Remover' : 'Adicionar'}
              </Button>
            }
          >
            {hasForma ? (
              <div className="space-y-3">
                <div>
                  <label className="field-label">Nome da forma</label>
                  <Input
                    {...form.register('formaAlternativa.nome')}
                    placeholder="Ex.: Forma de Lobo, Forma Espectral"
                  />
                  <FieldError
                    message={(errors.formaAlternativa as { nome?: { message?: string } })?.nome?.message}
                  />
                </div>
                <div>
                  <label className="field-label">Descrição</label>
                  <Textarea
                    rows={4}
                    {...form.register('formaAlternativa.descricao')}
                    placeholder="Regras, bônus, restrições e habilidades da forma alternativa."
                  />
                  <FieldError
                    message={(errors.formaAlternativa as { descricao?: { message?: string } })?.descricao?.message}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink/60">
                Clique em "Adicionar" para incluir uma forma alternativa.
              </p>
            )}
          </Section>

          {/* Habilidades */}
          <Section
            title="Habilidades"
            subtitle="Ações, reações, passivas e gatilhos da transformação."
            actions={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => appendHabilidade(blankTransformacaoAbility())}
              >
                + Adicionar
              </Button>
            }
          >
            <div className="space-y-4">
              {habilidades.length === 0 ? (
                <p className="text-sm text-ink/60">Nenhuma habilidade adicionada.</p>
              ) : null}
              {habilidades.map((f, idx) => (
                <HabilidadeRow
                  key={f.id}
                  form={form}
                  idx={idx}
                  err={errors.habilidades?.[idx]}
                  onRemove={() => removeHabilidade(idx)}
                />
              ))}
            </div>
          </Section>

          {/* Notas */}
          <Section title="Notas do mestre" defaultOpen={false}>
            <Textarea
              rows={5}
              {...form.register('notas')}
              placeholder="Notas internas, variantes, inspirações…"
            />
          </Section>
        </form>

        {/* Preview */}
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <FitBlock>
            <TransformacaoBlock ref={previewRef} transformacao={preview} />
          </FitBlock>
        </aside>
      </div>

      {/* Nó off-screen para export determinístico */}
      <div aria-hidden className="pointer-events-none absolute left-[-9999px] top-[-9999px]">
        <TransformacaoBlock ref={exportRef} transformacao={preview} />
      </div>
    </div>
  );
}

function HabilidadeRow({
  form,
  idx,
  err,
  onRemove,
}: {
  form: ReturnType<typeof useForm<Transformacao>>;
  idx: number;
  err?: { nome?: { message?: string }; tipo?: { message?: string }; descricao?: { message?: string } };
  onRemove: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <div className="space-y-2 rounded border border-ink/10 p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px_auto]">
        <div>
          <label className="field-label">Nome</label>
          <Input
            {...form.register(`habilidades.${idx}.nome`)}
            placeholder="Ex.: Fome de Sangue"
          />
          <FieldError message={err?.nome?.message} />
        </div>
        <div>
          <label className="field-label">Tipo</label>
          <Select {...form.register(`habilidades.${idx}.tipo`)}>
            {TRANSFORMACAO_ABILITY_KIND_VALUES.map((k) => (
              <option key={k} value={k}>{KIND_LABEL[k]}</option>
            ))}
          </Select>
          <FieldError message={err?.tipo?.message} />
        </div>
        <div className="flex items-end">
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Remover
          </Button>
        </div>
      </div>
      <div>
        <label className="field-label">Descrição</label>
        <Controller
          control={form.control}
          name={`habilidades.${idx}.descricao`}
          render={({ field }) => (
            <>
              <Textarea
                rows={3}
                ref={(el) => {
                  field.ref(el);
                  textareaRef.current = el;
                }}
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
                placeholder="Descrição da habilidade. Use **Keyword** para destacar termos."
              />
              <div className="mt-2">
                <KeywordChips
                  textareaRef={textareaRef as MutableRefObject<HTMLTextAreaElement | null>}
                  value={field.value}
                  onInsert={(next) => field.onChange(next)}
                />
              </div>
            </>
          )}
        />
        <FieldError message={err?.descricao?.message} />
      </div>
    </div>
  );
}
