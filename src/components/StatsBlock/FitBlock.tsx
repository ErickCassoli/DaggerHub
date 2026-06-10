import { useLayoutEffect, useRef, useState } from 'react';

const BLOCK_WIDTH = 450;

/**
 * Scales a fixed-450px StatsBlock down to fit the available container width on
 * narrow viewports (mobile phones). On screens wide enough, no transform is applied.
 * CSS transform doesn't affect layout, so we also shrink the container height to
 * match the visual height of the scaled content — no gap left below.
 */
export function FitBlock({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<{ transform?: string; height?: number }>({});

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const update = () => {
      const available = wrap.offsetWidth;
      if (available >= BLOCK_WIDTH) {
        setStyle({});
      } else {
        const s = available / BLOCK_WIDTH;
        setStyle({ transform: `scale(${s})`, height: inner.offsetHeight * s });
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    // O conteúdo (ex.: habilidades adicionadas no builder) muda de altura sem
    // redimensionar o wrapper — observar o inner mantém o clipping correto.
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ width: '100%', overflow: 'hidden', height: style.height }}>
      <div ref={innerRef} style={{ width: BLOCK_WIDTH, transformOrigin: 'top left', transform: style.transform }}>
        {children}
      </div>
    </div>
  );
}
