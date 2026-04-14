import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={clsx(
          'w-full rounded border border-ink/30 bg-parchment px-3 py-2 text-ink outline-none transition-colors',
          'focus:border-ink focus:ring-1 focus:ring-ink/40',
          className,
        )}
        {...rest}
      />
    );
  },
);
