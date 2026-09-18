import { useEffect, useRef } from 'react';
import { Check, X, RefreshCw, Loader2 } from 'lucide-react';
import type { Editor } from '@tiptap/react';
import type { InlineAiPhase } from '../../hooks/useInlineAi';

interface InlineSuggestionOverlayProps {
  state: InlineAiPhase;
  editor: Editor;
  onAccept: () => void;
  onReject: () => void;
}

export function InlineSuggestionOverlay({
  state,
  editor,
  onAccept,
  onReject,
}: InlineSuggestionOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.phase === 'idle') return;
    if (!overlayRef.current) return;
    const { from } = state;
    const domRect = editor.view.coordsAtPos(Math.max(0, from - 1));
    const overlayEl = overlayRef.current;
    const viewportW = window.innerWidth;
    const overlayH = overlayEl.offsetHeight || 220;
    const overlayW = overlayEl.offsetWidth || 480;
    let top = domRect.top - overlayH - 12;
    let left = domRect.left;
    if (top < 8) top = domRect.bottom + 12;
    if (left + overlayW > viewportW - 8) left = viewportW - overlayW - 8;
    if (left < 8) left = 8;
    overlayEl.style.top = top + window.scrollY + 'px';
    overlayEl.style.left = left + 'px';
  }, [state, editor]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (state.phase === 'idle') return;
      if (e.key === 'Tab') { e.preventDefault(); if (state.phase === 'preview') onAccept(); }
      if (e.key === 'Escape') { e.preventDefault(); onReject(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, onAccept, onReject]);

  if (state.phase === 'idle') return null;

  const isGenerating = state.phase === 'generating';
  const isPreview = state.phase === 'preview';
  const suggestedText = isPreview ? state.suggestedText : '';
  const originalText = state.originalText;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-label="AI Suggestion"
      style={{
        position: 'fixed', zIndex: 10000, width: '480px', maxWidth: 'calc(100vw - 16px)',
        backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.625rem 0.875rem', borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-subtle)',
      }}>
        {isGenerating
          ? <Loader2 size={13} style={{ color: 'var(--color-violet-500)', animation: 'spin 1s linear infinite' }} />
          : <RefreshCw size={13} style={{ color: 'var(--color-violet-500)' }} />}
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {isGenerating ? 'AI กำลังเขียน…' : 'AI เสนอข้อความ'}
        </span>
        <button onClick={onReject} aria-label="Close" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: '2px', borderRadius: '4px' }}>
          <X size={13} />
        </button>
      </div>

      <div style={{ padding: '0.75rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
        {originalText && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textDecoration: 'line-through', lineHeight: 1.6 }}>
            {originalText.length > 200 ? originalText.slice(0, 200) + '…' : originalText}
          </div>
        )}
        <div style={{ fontSize: '0.8125rem', color: isGenerating ? 'var(--color-text-secondary)' : 'var(--color-text-primary)', lineHeight: 1.7, position: 'relative' }}>
          {suggestedText || (isGenerating ? '' : '—')}
          {isGenerating && <span style={{ display: 'inline-block', width: '2px', height: '1em', backgroundColor: 'var(--color-violet-500)', marginLeft: '2px', verticalAlign: 'text-bottom', animation: 'blink 1s step-end infinite' }} />}
        </div>
      </div>

      {isPreview && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
          <button id="inline-ai-accept-btn" onClick={onAccept} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-blue-600))', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
            <Check size={12} /> ยอมรับ
          </button>
          <button id="inline-ai-reject-btn" onClick={onReject} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}>
            <X size={12} /> ยกเลิก
          </button>
          <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
            Tab ยอมรับ · Esc ยกเลิก
          </span>
        </div>
      )}
    </div>
  );
}
