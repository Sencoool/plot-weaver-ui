import { useRef, useState, useEffect } from 'react';
import { Send, Square, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { useAiStore } from '../../store/aiStore';
import { useAiGeneration } from '../../hooks/useAiGeneration';
import type { Editor } from '@tiptap/react';

interface AiComposerProps {
  novelId: string;
  episodeId?: string;
  editor: Editor | null;
  buildPinnedContext?: () => string;
}

// Context-aware quick prompts:
// - No messages yet → first-session prompts
// - Last message accepted → follow-up prompts
const FIRST_SESSION_PROMPTS = [
  'เขียนต่อจากตรงนี้',
  'เขียนบทสนทนา',
  'เพิ่มรายละเอียดฉาก',
  'เขียนฉากใหม่',
];

const FOLLOW_UP_PROMPTS = [
  'เขียนต่อจากตรงที่หยุด',
  'ทำให้ยาวขึ้น',
  'เพิ่มอารมณ์ให้มากขึ้น',
  'เปลี่ยนน้ำเสียง',
];

export function AiComposer({ novelId, episodeId, editor, buildPinnedContext }: AiComposerProps) {
  const status = useAiStore((s) => s.status);
  const messages = useAiStore((s) => s.messages);
  const temperature = useAiStore((s) => s.temperature);
  const setTemperature = useAiStore((s) => s.setTemperature);

  const [localPrompt, setLocalPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getEditorContent = () => {
    if (!editor) return '';
    if (editor.isDestroyed) throw new Error('Editor is syncing, please wait a moment and try again.');
    return editor.getHTML();
  };

  const { generate, cancel } = useAiGeneration(novelId, episodeId, getEditorContent, buildPinnedContext);

  const isRunning = status === 'generating' || status === 'streaming';

  // Determine which quick prompt set to show
  const hasAcceptedMessage = messages.some((m) => m.status === 'accepted');
  const quickPrompts = hasAcceptedMessage ? FOLLOW_UP_PROMPTS : FIRST_SESSION_PROMPTS;

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [localPrompt]);

  const handleGenerate = () => {
    if (!localPrompt.trim() || !novelId || isRunning) return;
    const text = localPrompt.trim();
    setLocalPrompt('');
    void generate(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isRunning) handleGenerate();
    }
  };

  return (
    <div
      style={{
        flexShrink: 0,
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-base)',
        padding: '0.75rem 0.875rem',
        display: 'flex', flexDirection: 'column', gap: '0.625rem',
      }}
    >
      {/* Quick-prompt chips — shown when not running */}
      {!isRunning && (
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {quickPrompts.map((qp) => (
            <button
              key={qp}
              onClick={() => setLocalPrompt(qp)}
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${localPrompt === qp ? '#6366f1' : 'var(--color-border)'}`,
                backgroundColor: localPrompt === qp ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: localPrompt === qp ? '#6366f1' : 'var(--color-text-muted)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
              }}
            >
              {qp}
            </button>
          ))}
        </div>
      )}

      {/* Main input row */}
      <div
        style={{
          display: 'flex', alignItems: 'flex-end', gap: '0.5rem',
          padding: '0.5rem 0.625rem', borderRadius: '0.75rem',
          border: '1.5px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-elevated)',
          transition: 'border-color var(--transition-fast)',
        }}
        onFocusCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#6366f1'; }}
        onBlurCapture={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)'; }}
      >
        <textarea
          ref={textareaRef}
          id="ai-prompt-textarea"
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRunning ? 'กำลังเขียน…' : 'พิมพ์คำสั่งให้ AI… (Enter ส่ง · Shift+Enter ขึ้นบรรทัด)'}
          disabled={isRunning}
          rows={1}
          style={{
            flex: 1, resize: 'none', border: 'none', outline: 'none',
            background: 'transparent', color: 'var(--color-text-primary)',
            fontSize: '0.875rem', lineHeight: 1.55,
            fontFamily: 'var(--font-sans)', caretColor: '#6366f1', overflow: 'hidden',
          }}
        />

        {/* Send / Stop */}
        {isRunning ? (
          <button
            id="ai-cancel-btn-composer"
            onClick={cancel}
            title="Stop generating"
            style={{
              width: 32, height: 32, borderRadius: '0.5rem', border: 'none',
              backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.22)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
          >
            <Square size={14} />
          </button>
        ) : (
          <button
            id="ai-generate-btn"
            onClick={handleGenerate}
            disabled={!localPrompt.trim() || !novelId || isRunning}
            title="Generate (Enter)"
            style={{
              width: 32, height: 32, borderRadius: '0.5rem', border: 'none',
              background: (!localPrompt.trim() || !novelId || isRunning)
                ? 'var(--color-surface)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: (!localPrompt.trim() || !novelId || isRunning)
                ? 'var(--color-text-muted)'
                : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: (!localPrompt.trim() || !novelId || isRunning) ? 'not-allowed' : 'pointer',
              flexShrink: 0, transition: 'all var(--transition-fast)',
            }}
          >
            <Send size={14} />
          </button>
        )}
      </div>

      {/* Settings toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            fontSize: '0.75rem', color: 'var(--color-text-muted)',
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
          }}
        >
          <Sliders size={12} />
          {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Advanced: temperature */}
      {showAdvanced && (
        <div style={{
          padding: '0.625rem 0.75rem',
          backgroundColor: 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          display: 'flex', flexDirection: 'column', gap: '0.375rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Creativity
            </label>
            <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700 }}>
              {temperature.toFixed(1)}
            </span>
          </div>
          <input
            type="range" min={0} max={2} step={0.1} value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            disabled={isRunning}
            aria-label="AI temperature"
            id="ai-temperature"
            style={{ width: '100%', accentColor: '#6366f1' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
            <span>Precise</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>
      )}
    </div>
  );
}
