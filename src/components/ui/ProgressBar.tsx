import React from 'react';

interface ProgressBarProps {
  value: number;       // 0–100
  max?: number;
  label?: string;
  showPercent?: boolean;
  variant?: 'primary' | 'ai' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

const variantColors: Record<NonNullable<ProgressBarProps['variant']>, string> = {
  primary: 'var(--color-blue-600)',
  ai:      'linear-gradient(90deg, var(--color-blue-600), var(--color-purple-600))',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger:  'var(--color-danger)',
};

const sizeHeights: Record<NonNullable<ProgressBarProps['size']>, string> = {
  sm: '4px',
  md: '8px',
  lg: '12px',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  variant = 'primary',
  size = 'md',
  animated = false,
  className = '',
  style,
  id,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = variantColors[variant];
  const height = sizeHeights[size];

  return (
    <div className={className} style={style} id={id}>
      {(label || showPercent) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.375rem',
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          {label && <span style={{ fontWeight: 500 }}>{label}</span>}
          {showPercent && (
            <span style={{ fontWeight: 600, color: 'var(--color-blue-600)' }}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        style={{
          width: '100%',
          height,
          backgroundColor: 'var(--color-border)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        {/* Fill */}
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 'var(--radius-full)',
            transition: 'width var(--transition-normal)',
            animation: animated ? 'progress-shimmer 1.5s infinite' : undefined,
          }}
        />
      </div>

      <style>{`
        @keyframes progress-shimmer {
          0%   { opacity: 1; }
          50%  { opacity: 0.75; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
