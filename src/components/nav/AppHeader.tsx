import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { QuickRefModal } from '@/components/QuickRef/QuickRefModal';
import { applyTheme, getTheme, type Theme } from '@/lib/theme';

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
  { to: '/ambientes', label: 'Ambientes', end: false },
];

export function AppHeader({ actions, subtitle }: AppHeaderProps) {
  const [refOpen, setRefOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getTheme);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  };

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-ink/20 pb-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl uppercase tracking-wider text-ink sm:text-3xl">DaggerHub</h1>
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
                      ? 'bg-ink text-parchment shadow-[0_2px_0_#a3802e]'
                      : 'text-ink/70 hover:bg-ink/10',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setRefOpen(true)}
            title="Abrir painel de referência rápida do mestre"
          >
            Ref. Rápida
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? '◑ Claro' : '◐ Escuro'}
          </Button>
          {actions}
        </div>
      </header>
      <QuickRefModal open={refOpen} onClose={() => setRefOpen(false)} />
    </>
  );
}
