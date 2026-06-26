import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  /** Optional dot color, e.g. '#f87171' or 'var(--color-success)' */
  color?: string;
  /** Optional lucide icon node rendered before the label */
  icon?: React.ReactNode;
  /** Optional description shown below the label in the dropdown */
  description?: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  selectSize?: 'sm' | 'md' | 'lg';
  /** Extra inline styles applied to the trigger button */
  style?: React.CSSProperties;
  className?: string;
  id?: string;
}

const sizeTokens = {
  sm: { padding: '0.375rem 0.625rem', fontSize: '0.875rem', minHeight: '32px' },
  md: { padding: '0.5rem 0.75rem', fontSize: '0.9375rem', minHeight: '38px' },
  lg: { padding: '0.625rem 1rem', fontSize: '1rem', minHeight: '44px' },
};

export function Select({
  options,
  value,
  onChange,
  label,
  error,
  hint,
  placeholder = 'Select…',
  disabled = false,
  selectSize = 'md',
  style,
  className = '',
  id,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const triggerId = id ?? `select-${uid}`;
  const listId = `${triggerId}-list`;

  const selected = options.find((o) => o.value === value) ?? null;
  const sz = sizeTokens[selectSize];

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* Keyboard navigation */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((p) => !p); }
    if (e.key === 'Escape') setOpen(false);
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && open) {
      e.preventDefault();
      const idx = options.findIndex((o) => o.value === value);
      const next = e.key === 'ArrowDown'
        ? Math.min(idx + 1, options.length - 1)
        : Math.max(idx - 1, 0);
      onChange(options[next].value);
    }
  };

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.value);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`flex flex-col gap-1.5 ${className}`} style={{ position: 'relative' }}>
      {label && (
        <label
          htmlFor={triggerId}
          style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}
        >
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={!!error}
        disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        onKeyDown={handleKeyDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
          ...sz,
          fontFamily: 'var(--font-sans)',
          color: selected ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          backgroundColor: 'var(--color-bg-elevated)',
          border: `1px solid ${error ? 'var(--color-danger)' : open ? 'var(--color-border-focus)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          boxShadow: open ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'border-color 150ms, box-shadow 150ms',
          outline: 'none',
          textAlign: 'left',
          ...style,
        }}
      >
        {/* Color dot */}
        {selected?.color && (
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: selected.color,
              flexShrink: 0,
            }}
          />
        )}
        {/* Icon */}
        {selected?.icon && (
          <span style={{ display: 'flex', flexShrink: 0, color: 'var(--color-text-muted)' }}>
            {selected.icon}
          </span>
        )}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={14}
          style={{
            flexShrink: 0,
            color: 'var(--color-text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 200ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </button>

      {/* Dropdown list */}
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 'var(--z-dropdown)' as unknown as number,
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            padding: '0.25rem',
            margin: 0,
            listStyle: 'none',
            maxHeight: '240px',
            overflowY: 'auto',
            animation: 'fade-in 120ms ease-out',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.625rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'var(--color-surface)' : 'transparent',
                  color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  fontSize: sz.fontSize,
                  fontFamily: 'var(--font-sans)',
                  transition: 'background-color 100ms, color 100ms',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    (e.currentTarget as HTMLLIElement).style.backgroundColor = 'var(--color-bg-subtle)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected)
                    (e.currentTarget as HTMLLIElement).style.backgroundColor = 'transparent';
                }}
              >
                {/* Color dot */}
                {opt.color && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: opt.color,
                      flexShrink: 0,
                    }}
                  />
                )}
                {/* Icon */}
                {opt.icon && (
                  <span style={{ display: 'flex', flexShrink: 0, color: 'var(--color-text-muted)' }}>
                    {opt.icon}
                  </span>
                )}
                <span style={{ flex: 1 }}>
                  {opt.label}
                  {opt.description && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        marginTop: '1px',
                      }}
                    >
                      {opt.description}
                    </span>
                  )}
                </span>
                {isSelected && (
                  <Check size={13} style={{ flexShrink: 0, color: 'var(--color-blue-500)' }} />
                )}
              </li>
            );
          })}
        </ul>
      )}

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
}
