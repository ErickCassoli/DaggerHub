import { useEffect, useRef } from 'react';

export function useKeyboardSave(onSave: () => void): void {
  const ref = useRef(onSave);
  ref.current = onSave;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        ref.current();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
}
