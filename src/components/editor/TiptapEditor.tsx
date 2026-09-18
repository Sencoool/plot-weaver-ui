import { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import TextAlign from '@tiptap/extension-text-align';
import { EditorToolbar } from './EditorToolbar';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { EditorWordCount } from './EditorWordCount';
import { InlineSuggestionOverlay } from './InlineSuggestionOverlay';
import { QuickPromptBar } from './QuickPromptBar';
import { useInlineAi } from '../../hooks/useInlineAi';
import type { Editor } from '@tiptap/react';

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  onEditorReady?: (editor: Editor) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  novelId?: string;
  episodeId?: string;
}

export function TiptapEditor({
  content = '',
  onChange,
  onEditorReady,
  placeholder = 'Begin your story here… Let the words flow.',
  editable = true,
  className = '',
  novelId = '',
  episodeId,
}: TiptapEditorProps) {
  const [isQuickPromptOpen, setIsQuickPromptOpen] = useState(false);
  const [quickPromptAnchor, setQuickPromptAnchor] = useState<DOMRect | null>(null);

  const { state: inlineAiState, triggerAction, acceptSuggestion, rejectSuggestion } = useInlineAi({
    novelId,
    episodeId,
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-empty',
      }),
      CharacterCount,
      Highlight.configure({ multicolor: false }),
      Typography,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none',
        style: 'padding: 2rem 2.5rem; min-height: 60vh;',
      },
      handleKeyDown(view, event) {
        // Cmd+K / Ctrl+K → open Quick Prompt Bar
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
          event.preventDefault();
          const { from } = view.state.selection;
          const coords = view.coordsAtPos(from);
          const rect = new DOMRect(coords.left, coords.top, 0, coords.bottom - coords.top);
          setQuickPromptAnchor(rect);
          setIsQuickPromptOpen(true);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      onEditorReady?.(editor);
    }
  }, [editor, onEditorReady]);

  const handleInlineAiAction = useCallback((action: import('../../hooks/useInlineAi').InlineAiAction) => {
    if (!editor) return;
    triggerAction(action, editor);
  }, [editor, triggerAction]);

  const handleQuickPromptSubmit = useCallback((prompt: string) => {
    if (!editor) return;
    setIsQuickPromptOpen(false);
    setQuickPromptAnchor(null);
    triggerAction('custom', editor, prompt);
  }, [editor, triggerAction]);

  const handleAccept = useCallback(() => {
    if (!editor) return;
    acceptSuggestion(editor);
  }, [editor, acceptSuggestion]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--color-bg-elevated)', position: 'relative' }}
    >
      {/* Sticky Toolbar */}
      {editable && editor && (
        <EditorToolbar editor={editor} />
      )}

      {/* Bubble menu (selection) */}
      {editable && editor && (
        <EditorBubbleMenu
          editor={editor}
          inlineAiState={inlineAiState}
          onInlineAiAction={handleInlineAiAction}
        />
      )}

      {/* Inline AI suggestion overlay */}
      {editor && inlineAiState.phase !== 'idle' && (
        <InlineSuggestionOverlay
          state={inlineAiState}
          editor={editor}
          onAccept={handleAccept}
          onReject={rejectSuggestion}
        />
      )}

      {/* Cmd+K Quick Prompt Bar */}
      {isQuickPromptOpen && (
        <QuickPromptBar
          anchorRect={quickPromptAnchor}
          onSubmit={handleQuickPromptSubmit}
          onClose={() => { setIsQuickPromptOpen(false); setQuickPromptAnchor(null); }}
        />
      )}

      {/* Scrollable content area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <EditorContent editor={editor} />
      </div>

      {/* Word count footer */}
      {editor && (
        <EditorWordCount editor={editor} />
      )}
    </div>
  );
}

export type { Editor };
