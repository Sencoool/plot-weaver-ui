import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/react';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Highlighter, Sparkles, Expand, MessageSquare, Languages, Loader2 } from 'lucide-react';
import type { InlineAiAction, InlineAiPhase } from '../../hooks/useInlineAi';

interface EditorBubbleMenuProps {
  editor: Editor;
  inlineAiState?: InlineAiPhase;
  onInlineAiAction?: (action: InlineAiAction) => void;
}

export function EditorBubbleMenu({ editor, inlineAiState, onInlineAiAction }: EditorBubbleMenuProps) {
  const isAiGenerating = inlineAiState?.phase === 'generating';

  const formatButtons = [
    { id: 'bubble-bold', icon: <Bold size={13} />, label: 'Bold', action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold') },
    { id: 'bubble-italic', icon: <Italic size={13} />, label: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic') },
    { id: 'bubble-underline', icon: <UnderlineIcon size={13} />, label: 'Underline', action: () => editor.chain().focus().toggleUnderline().run(), isActive: editor.isActive('underline') },
    { id: 'bubble-strike', icon: <Strikethrough size={13} />, label: 'Strikethrough', action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike') },
    { id: 'bubble-highlight', icon: <Highlighter size={13} />, label: 'Highlight', action: () => editor.chain().focus().toggleHighlight().run(), isActive: editor.isActive('highlight') },
  ];

  const aiButtons: { id: string; icon: React.ReactNode; label: string; action: InlineAiAction }[] = [
    { id: 'bubble-ai-rewrite', icon: <Sparkles size={13} />, label: 'เขียนใหม่', action: 'rewrite' },
    { id: 'bubble-ai-expand', icon: <Expand size={13} />, label: 'ขยายความ', action: 'expand' },
    { id: 'bubble-ai-dialogue', icon: <MessageSquare size={13} />, label: 'บทสนทนา', action: 'to-dialogue' },
    { id: 'bubble-ai-translate', icon: <Languages size={13} />, label: 'แปลภาษา', action: 'translate' },
  ];

  // Only show AI buttons when selection is >= 10 chars
  const { from, to } = editor.state.selection;
  const selectionLength = to - from;
  const showAiButtons = onInlineAiAction && selectionLength >= 10;

  const btnStyle = (isActive = false, isAi = false): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
    padding: isAi ? '0.25rem 0.5rem' : '0',
    width: isAi ? 'auto' : '26px',
    height: '26px',
    borderRadius: 'var(--radius-sm)', border: 'none', cursor: isAiGenerating ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-fast)',
    fontSize: '0.7rem', fontWeight: 500,
    backgroundColor: isActive
      ? 'var(--color-blue-600)'
      : isAi ? 'transparent' : 'transparent',
    color: isActive ? '#fff' : isAi ? 'var(--color-violet-600)' : 'var(--color-text-secondary)',
    opacity: isAiGenerating ? 0.5 : 1,
    whiteSpace: 'nowrap',
  });

  return (
    <BubbleMenu
      editor={editor}
      updateDelay={150}
      options={{ placement: 'top', strategy: 'fixed', zIndex: 9999 }}
    >
      <div
        role="toolbar"
        aria-label="Inline formatting and AI"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.125rem',
          padding: '0.375rem', backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Formatting buttons */}
        {formatButtons.map((btn) => (
          <button
            key={btn.id} id={btn.id} onClick={btn.action}
            aria-label={btn.label} aria-pressed={btn.isActive} title={btn.label}
            style={btnStyle(btn.isActive)}
          >
            {btn.icon}
          </button>
        ))}

        {/* Divider + AI buttons */}
        {showAiButtons && (
          <>
            <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--color-border)', margin: '0 0.25rem', flexShrink: 0 }} />
            {isAiGenerating
              ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0 0.375rem', color: 'var(--color-violet-500)', fontSize: '0.7rem' }}>
                  <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>กำลังเขียน…</span>
                </div>
              )
              : aiButtons.map((btn) => (
                <button
                  key={btn.id} id={btn.id}
                  onClick={() => onInlineAiAction(btn.action)}
                  aria-label={btn.label} title={btn.label}
                  style={btnStyle(false, true)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-violet-50)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  }}
                >
                  {btn.icon}
                  <span>{btn.label}</span>
                </button>
              ))
            }
          </>
        )}
      </div>
    </BubbleMenu>
  );
}
