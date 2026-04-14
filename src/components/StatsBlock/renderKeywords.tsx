import type { ReactNode } from 'react';
import { KEYWORDS } from '@/data/keywords';

/**
 * Renderiza texto aplicando negrito em:
 * 1. Keywords do sistema (ex: "Vulnerável", "Próximo", "Ação").
 * 2. Markdown-like **texto** em negrito explícito do usuário.
 */
export function renderKeywords(text: string): ReactNode[] {
  if (!text) return [];

  // Primeiro trata **...** explícitos do usuário.
  // Regex combinado: captura **...** OU uma keyword inteira (case-insensitive).
  const keywordAlt = KEYWORDS
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const pattern = new RegExp(`(\\*\\*[^*]+\\*\\*|\\b(?:${keywordAlt})\\b)`, 'gi');

  const parts = text.split(pattern).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Checa se é uma keyword
    const isKeyword = KEYWORDS.some((k) => k.toLowerCase() === part.toLowerCase());
    if (isKeyword) return <strong key={i}>{part}</strong>;
    return <span key={i}>{part}</span>;
  });
}
