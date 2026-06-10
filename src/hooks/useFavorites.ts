import { useCallback, useState } from 'react';

function loadFavorites(storageKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed as string[]);
  } catch {
    return new Set();
  }
}

function saveFavorites(storageKey: string, favorites: Set<string>): void {
  localStorage.setItem(storageKey, JSON.stringify([...favorites]));
}

/** Conjunto de IDs favoritados persistido em localStorage sob `storageKey`. */
export function useFavorites(storageKey: string) {
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites(storageKey));

  const toggle = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        saveFavorites(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  return { favorites, toggle };
}
