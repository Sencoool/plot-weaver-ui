import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/react';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Highlighter } from 'lucide-react';

interface EditorBubbleMenuProps {
  editor: Editor;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const buttons = [
    {
      id: 'bubble-bold',
      icon: <Bold size={13} />,
      label: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      id: 'bubble-italic',
      icon: <Italic size={13} />,
      label: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      id: 'bubble-underline',
      icon: <UnderlineIcon size={13} />,
      label: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
    },
    {
      id: 'bubble-strike',
      icon: <Strikethrough size={13} />,
      label: 'Strikethrough',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
    },
    {
      id: 'bubble-highlight',
      icon: <Highlighter size={13} />,
      label: 'Highlight',
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: editor.isActive('highlight'),
    },
  ];

  return (
    <BubbleMenu
      editor={editor}
      updateDelay={150}
      options={{ placement: 'top' }}
    >
      <div
        role="toolbar"
        aria-label="Inline formatting"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.125rem',
          padding: '0.375rem',
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {buttons.map((btn) => (
          <button
            key={btn.id}
            id={btn.id}
            onClick={btn.action}
            aria-label={btn.label}
            aria-pressed={btn.isActive}
            title={btn.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              backgroundColor: btn.isActive ? 'var(--color-blue-600)' : 'transparent',
              color: btn.isActive ? '#fff' : 'var(--color-text-secondary)',
            }}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </BubbleMenu>
  );
}
