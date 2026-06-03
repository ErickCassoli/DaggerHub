import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, hasError, ...rest }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={hasError || undefined}
        className={clsx(
          'w-full rounded border bg-parchment px-3 py-2 text-ink outline-none transition-colors',
          hasError
            ? 'border-red-600 ring-1 ring-red-600/30'
            : 'border-ink/30 focus:border-ink focus:ring-1 focus:ring-ink/40',
          className,
        )}
        {...rest}
      />
    );
  },
);
