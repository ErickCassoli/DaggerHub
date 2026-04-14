import { forwardRef, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={clsx(
          'w-full appearance-none rounded border border-ink/30 bg-parchment px-3 py-2 text-ink outline-none',
          'focus:border-ink focus:ring-1 focus:ring-ink/40',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    );
  },
);
