interface SpinnerProps {
  size?: number;
  className?: string;
  color?: string;
}

export function Spinner({ size = 20, className = '', color = 'var(--color-blue-600)' }: SpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-spin ${className}`}
      aria-label="Loading"
      role="status"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface ProgressBarProps {
  value: number; // 0–100
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: 'blue' | 'purple' | 'green';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const colorMap = {
  blue: 'var(--color-blue-600)',
  purple: 'var(--color-purple-600)',
  green: 'var(--color-success)',
};

const heightMap = { sm: '4px', md: '8px', lg: '12px' };

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  color = 'blue',
  size = 'md',
  animated = true,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div>
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
          {label && <span>{label}</span>}
          {showPercent && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        style={{
          width: '100%',
          height: heightMap[size],
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: colorMap[color],
            borderRadius: 'var(--radius-full)',
            transition: animated ? 'width 0.4s ease-out' : undefined,
            backgroundImage: animated && pct < 100
              ? `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 6px,
                  rgba(255,255,255,0.15) 6px,
                  rgba(255,255,255,0.15) 12px
                )`
              : undefined,
          }}
        />
      </div>
    </div>
  );
}
