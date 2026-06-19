import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  inputSize?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const sizeClass = { sm: 'input-sm', md: '', lg: 'input-lg' };

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, inputSize = 'md', leftIcon, rightIcon, className = '', id, ...rest }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftIcon && (
            <span
              style={{
                position: 'absolute',
                left: '0.75rem',
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
                display: 'flex',
              }}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'input',
              sizeClass[inputSize],
              leftIcon ? 'pl-9' : '',
              rightIcon ? 'pr-9' : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            style={error ? { borderColor: 'var(--color-danger)' } : {}}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...rest}
          />
          {rightIcon && (
            <span
              style={{
                position: 'absolute',
                right: '0.75rem',
                color: 'var(--color-text-muted)',
                display: 'flex',
              }}
            >
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            style={{ fontSize: '0.8125rem', color: 'var(--color-danger)' }}
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && hint && (
          <p
            id={`${inputId}-hint`}
            style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...rest }, ref) => {
    const inputId = id ?? `textarea-${Math.random().toString(36).slice(2, 7)}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={['textarea', error ? '' : '', className].filter(Boolean).join(' ')}
          style={error ? { borderColor: 'var(--color-danger)' } : {}}
          aria-invalid={!!error}
          {...rest}
        />
        {error && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-danger)' }} role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{hint}</p>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
