import { useEffect } from 'react';
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
import type { Editor } from '@tiptap/react';

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  onEditorReady?: (editor: Editor) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export function TiptapEditor({
  content = '',
  onChange,
  onEditorReady,
  placeholder = 'Begin your story here… Let the words flow.',
  editable = true,
  className = '',
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false, // we keep it simple for novel writing
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

  return (
    <div
      className={`flex flex-col h-full ${className}`}
      style={{ backgroundColor: 'var(--color-bg-elevated)' }}
    >
      {/* Sticky Toolbar */}
      {editable && editor && (
        <EditorToolbar editor={editor} />
      )}

      {/* Bubble menu (appears on selection) */}
      {editable && editor && (
        <EditorBubbleMenu editor={editor} />
      )}

      {/* Scrollable content area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
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
