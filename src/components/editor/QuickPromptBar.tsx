import { useEffect, useRef } from 'react';
import { Sparkles, X } from 'lucide-react';

interface QuickPromptBarProps {
  anchorRect: DOMRect | null;
  onSubmit: (prompt: string) => void;
  onClose: () => void;
}

export function QuickPromptBar({ anchorRect, onSubmit, onClose }: QuickPromptBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Auto-focus
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Position near cursor
  useEffect(() => {
    if (!anchorRect || !barRef.current) return;
    const barEl = barRef.current;
    const viewportW = window.innerWidth;
    const barW = 420;

    const top = anchorRect.bottom + window.scrollY + 8;
    let left = anchorRect.left + window.scrollX;

    if (left + barW > viewportW - 8) left = viewportW - barW - 8;
    if (left < 8) left = 8;

    barEl.style.top = top + 'px';
    barEl.style.left = left + 'px';
  }, [anchorRect]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const val = inputRef.current?.value.trim();
      if (val) onSubmit(val);
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const QUICK_SUGGESTIONS = [
    'เขียนต่อจากตรงนี้',
    'ขยายความ',
    'เพิ่มบทสนทนา',
    'เขียนใหม่',
  ];

  return (
    <div
      ref={barRef}
      role="dialog"
      aria-label="Quick AI Prompt"
      style={{
        position: 'fixed', zIndex: 10001, width: '420px', maxWidth: 'calc(100vw - 16px)',
        backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden',
        animation: 'fadeInScale 0.12s ease-out',
      }}
    >
      {/* Input row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--color-border)' }}>
        <Sparkles size={14} style={{ color: 'var(--color-violet-500)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          id="quick-prompt-input"
          type="text"
          placeholder="สั่งให้ AI ทำอะไร… (Enter ส่ง · Esc ยกเลิก)"
          onKeyDown={handleKeyDown}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            fontSize: '0.875rem', color: 'var(--color-text-primary)',
          }}
        />
        <button
          onClick={onClose}
          aria-label="Close Quick Prompt"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: '2px', borderRadius: '4px', flexShrink: 0 }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Quick suggestion chips */}
      <div style={{ display: 'flex', gap: '0.375rem', padding: '0.5rem 0.75rem', flexWrap: 'wrap' }}>
        {QUICK_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSubmit(s)}
            style={{
              padding: '0.25rem 0.625rem',
              fontSize: '0.75rem',
              background: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: '9999px',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-violet-500)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-violet-600)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
