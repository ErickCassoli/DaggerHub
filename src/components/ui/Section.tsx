import { useState, type ReactNode } from 'react';
import clsx from 'clsx';

interface SectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  actions?: ReactNode;
}

export function Section({ title, subtitle, defaultOpen = true, children, actions }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-md border border-ink/20 bg-white/60 shadow-sm">
      <header className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-left"
        >
          <span
            className={clsx(
              'inline-block transform transition-transform text-ink/60',
              open ? 'rotate-90' : 'rotate-0',
            )}
            aria-hidden
          >
            ▶
          </span>
          <div>
            <h2 className="font-display text-lg uppercase tracking-wide text-ink">{title}</h2>
            {subtitle ? <p className="text-xs text-ink/60">{subtitle}</p> : null}
          </div>
        </button>
        {actions}
      </header>
      {open ? <div className="space-y-4 p-4">{children}</div> : null}
    </section>
  );
}
