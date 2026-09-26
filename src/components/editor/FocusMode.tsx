import { useEffect, useCallback } from 'react';
import { X, Sparkles } from 'lucide-react';

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAiPanel: () => void;
  children: React.ReactNode;
  wordCount?: number;
}

/**
 * Full-screen focus mode wrapper.
 * - Hides everything except the editor content.
 * - Shows word count bottom-right.
 * - Cmd+Shift+A → opens AI panel (passed up via callback).
 * - Escape → exits focus mode.
 */
export function FocusMode({ isOpen, onClose, onOpenAiPanel, children, wordCount = 0 }: FocusModeProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') { onClose(); return; }
    // Cmd/Ctrl + Shift + A → open AI
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      onOpenAiPanel();
    }
  }, [isOpen, onClose, onOpenAiPanel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll while in focus mode
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="focus-mode-overlay"
      aria-label="Focus Mode"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'var(--color-bg-elevated)',
        display: 'flex', flexDirection: 'column',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      {/* Top bar — minimal: just exit + AI hint */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.625rem 1.5rem', flexShrink: 0,
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '5px',
            background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-blue-600))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={11} color="#fff" />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Focus Mode
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* AI shortcut hint */}
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <kbd style={{
              padding: '0.125rem 0.375rem', borderRadius: '4px',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              fontSize: '0.6875rem', fontFamily: 'monospace',
            }}>Ctrl+Shift+A</kbd>
            {' '}AI &nbsp;·&nbsp;{' '}
            <kbd style={{
              padding: '0.125rem 0.375rem', borderRadius: '4px',
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              fontSize: '0.6875rem', fontFamily: 'monospace',
            }}>Esc</kbd>
            {' '}Exit
          </span>
          <button
            id="focus-mode-exit-btn"
            onClick={onClose}
            title="Exit Focus Mode (Esc)"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.3rem 0.625rem',
              background: 'none', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              color: 'var(--color-text-secondary)', fontSize: '0.75rem',
              transition: 'all 0.15s',
            }}
          >
            <X size={12} /> ออกจาก Focus Mode
          </button>
        </div>
      </div>

      {/* Centered editor — constrained 680px */}
      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '2rem 1rem',
      }}>
        <div style={{ width: '100%', maxWidth: '680px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>

      {/* Word count — bottom right */}
      <div style={{
        position: 'fixed', bottom: '1.25rem', right: '1.5rem',
        fontSize: '0.75rem', color: 'var(--color-text-muted)',
        background: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-full)',
        padding: '0.25rem 0.75rem',
        pointerEvents: 'none',
      }}>
        {wordCount.toLocaleString()} คำ
      </div>
    </div>
  );
}
