import { X, Sparkles, Wand2, RotateCcw } from 'lucide-react';
import { useAiStore } from '../../store/aiStore';
import { Button } from '../ui/Button';
import { AiPromptInput } from './AiPromptInput';
import { AiStreamOutput } from './AiStreamOutput';
import { AiProgressBar } from './AiProgressBar';
import { AiDiffView } from './AiDiffView';
import type { Editor } from '@tiptap/react';

interface AiPanelProps {
  novelId: string;
  episodeId?: string;
  editor: Editor | null;
}

export function AiPanel({ novelId, episodeId, editor }: AiPanelProps) {
  const {
    isPanelOpen,
    closePanel,
    status,
    generatedText,
    originalText,
    streamedText,
    reset,
  } = useAiStore();

  const handleAccept = () => {
    if (editor && generatedText) {
      // Replace entire editor content with AI output
      editor.commands.setContent(generatedText);
    }
    reset();
  };

  const handleReject = () => {
    if (editor && originalText) {
      editor.commands.setContent(originalText);
    }
    reset();
  };

  if (!isPanelOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closePanel}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 199,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Sliding panel */}
      <div
        role="complementary"
        aria-label="AI Writing Assistant"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 'min(420px, 95vw)',
          backgroundColor: 'var(--color-bg-elevated)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slide-in-right var(--transition-normal) ease-out',
        }}
      >
        {/* Panel Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
            background: 'linear-gradient(135deg, var(--color-blue-600), var(--color-purple-600))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Sparkles size={18} color="#fff" />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
              AI Writing Assistant
            </span>
          </div>
          <button
            onClick={closePanel}
            aria-label="Close AI panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem',
              cursor: 'pointer',
              color: '#fff',
              transition: 'background var(--transition-fast)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Panel Body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* State: idle or generating — show prompt input */}
          {(status === 'idle' || status === 'generating' || status === 'streaming') && (
            <AiPromptInput novelId={novelId} episodeId={episodeId} editor={editor} />
          )}

          {/* Segment progress bar */}
          {(status === 'generating' || status === 'streaming') && (
            <AiProgressBar />
          )}

          {/* Streaming text output */}
          {(status === 'streaming' || status === 'generating') && streamedText && (
            <AiStreamOutput text={streamedText} isStreaming />
          )}

          {/* Done: diff view + accept/reject */}
          {status === 'done' && (
            <>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                Generation complete. Review the changes below and choose to accept or reject.
              </p>
              <AiDiffView original={originalText} generated={generatedText} />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button
                  variant="primary"
                  style={{ flex: 1 }}
                  leftIcon={<Wand2 size={15} />}
                  onClick={handleAccept}
                  id="ai-accept-btn"
                >
                  Accept
                </Button>
                <Button
                  variant="secondary"
                  style={{ flex: 1 }}
                  leftIcon={<RotateCcw size={15} />}
                  onClick={handleReject}
                  id="ai-reject-btn"
                >
                  Reject
                </Button>
              </div>
            </>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <p style={{ color: 'var(--color-danger)', fontSize: '0.875rem', fontWeight: 600 }}>
                Generation failed
              </p>
              <button
                onClick={reset}
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8125rem',
                  color: 'var(--color-danger)',
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
