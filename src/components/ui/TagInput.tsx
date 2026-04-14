import { useState, type KeyboardEvent } from 'react';
import clsx from 'clsx';

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  id?: string;
}

export function TagInput({ value, onChange, placeholder, id }: TagInputProps) {
  const [draft, setDraft] = useState('');

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (value.includes(tag)) return;
    onChange([...value, tag]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(draft);
      setDraft('');
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div
      className={clsx(
        'flex min-h-[2.5rem] w-full flex-wrap items-center gap-2 rounded border border-ink/30 bg-parchment px-2 py-1',
        'focus-within:border-ink focus-within:ring-1 focus-within:ring-ink/40',
      )}
    >
      {value.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1 rounded bg-ink/10 px-2 py-0.5 text-sm text-ink"
        >
          {tag}
          <button
            type="button"
            className="text-ink/60 hover:text-ink"
            onClick={() => remove(i)}
            aria-label={`Remover ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (draft.trim()) {
            addTag(draft);
            setDraft('');
          }
        }}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[8rem] bg-transparent py-1 outline-none"
      />
    </div>
  );
}
