import { useAiStore } from '../../store/aiStore';
import { ProgressBar } from '../ui/Spinner';
import { Layers } from 'lucide-react';

export function AiProgressBar() {
  const { currentSegment, totalSegments, status, streamedText } = useAiStore();

  const isSegmented = totalSegments > 1;
  const charCount = streamedText.length;

  return (
    <div
      style={{
        padding: '0.875rem',
        backgroundColor: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      {isSegmented ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
            <Layers size={14} style={{ color: 'var(--color-purple-500)' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Segment {currentSegment} of {totalSegments}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
              {charCount.toLocaleString()} chars
            </span>
          </div>
          <ProgressBar
            value={currentSegment}
            max={totalSegments}
            color="purple"
            size="md"
            animated
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
            Writing long-form content in segments for best quality…
          </p>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {status === 'generating' ? 'Preparing…' : 'Writing…'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {charCount.toLocaleString()} chars
            </span>
          </div>
          {/* Indeterminate progress for single-shot */}
          <div
            style={{
              height: '6px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '40%',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(90deg, var(--color-blue-600), var(--color-purple-500))',
                animation: 'indeterminate-progress 1.5s ease-in-out infinite',
              }}
            />
          </div>
          <style>{`
            @keyframes indeterminate-progress {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(350%); }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
