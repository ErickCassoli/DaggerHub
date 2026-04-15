import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import type { ReactNode } from 'react';

interface AppHeaderProps {
  /** Slot opcional à direita: botões de ação específicos da página. */
  actions?: ReactNode;
  /** Subtítulo da página atual (mostrado abaixo do título). */
  subtitle?: string;
}

const NAV = [
  { to: '/', label: 'Biblioteca', end: true },
  { to: '/bestiario', label: 'Bestiário', end: false },
  { to: '/encounters', label: 'Encontros', end: false },
];

export function AppHeader({ actions, subtitle }: AppHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-ink/20 pb-4">
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wider text-ink">DaggerHub</h1>
        <p className="text-sm text-ink/70">{subtitle ?? 'Gerador de stat blocks — Daggerheart (pt-BR)'}</p>
        <nav className="mt-3 flex flex-wrap gap-1 text-sm">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  'rounded px-3 py-1 font-semibold uppercase tracking-wide transition-colors',
                  isActive
                    ? 'bg-ink text-parchment'
                    : 'text-ink/70 hover:bg-ink/10',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
