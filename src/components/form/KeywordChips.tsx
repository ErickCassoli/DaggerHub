import { useRef, type MutableRefObject } from 'react';
import { KEYWORDS } from '@/data/keywords';

interface KeywordChipsProps {
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
  onInsert: (next: string) => void;
  value: string;
}

/**
 * Insere `**Keyword**` no caret do textarea referenciado.
 * Se não houver foco, anexa ao final separado por espaço.
 */
export function KeywordChips({ textareaRef, value, onInsert }: KeywordChipsProps) {
  const last = useRef<string>('');

  const insert = (keyword: string) => {
    last.current = keyword;
    const token = `**${keyword}**`;
    const ta = textareaRef.current;
    if (!ta) {
      onInsert(value ? `${value} ${token}` : token);
      return;
    }
    const start = ta.selectionStart ?? value.length;
    const end = ta.selectionEnd ?? value.length;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const needsSpaceBefore = before && !/\s$/.test(before);
    const needsSpaceAfter = after && !/^\s/.test(after);
    const insertion = `${needsSpaceBefore ? ' ' : ''}${token}${needsSpaceAfter ? ' ' : ''}`;
    const next = before + insertion + after;
    onInsert(next);

    // Reposiciona o cursor após inserção.
    requestAnimationFrame(() => {
      ta.focus();
      const pos = (before + insertion).length;
      ta.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="flex flex-wrap gap-1">
      {KEYWORDS.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => insert(k)}
          className="rounded-full border border-ink/30 bg-parchment px-2 py-0.5 text-[11px] text-ink hover:bg-ink/10"
        >
          {k}
        </button>
      ))}
    </div>
  );
}
