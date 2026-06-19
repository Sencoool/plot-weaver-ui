import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Highlighter,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, Minus,
  AlignLeft, AlignCenter, AlignRight, Undo2, Redo2,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor;
}

interface ToolbarButton {
  id: string;
  icon: React.ReactNode;
  label: string;
  action: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

interface ToolbarGroup {
  id: string;
  buttons: ToolbarButton[];
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const groups: ToolbarGroup[] = [
    {
      id: 'history',
      buttons: [
        {
          id: 'undo',
          icon: <Undo2 size={15} />,
          label: 'Undo',
          action: () => editor.chain().focus().undo().run(),
          disabled: !editor.can().chain().focus().undo().run(),
        },
        {
          id: 'redo',
          icon: <Redo2 size={15} />,
          label: 'Redo',
          action: () => editor.chain().focus().redo().run(),
          disabled: !editor.can().chain().focus().redo().run(),
        },
      ],
    },
    {
      id: 'headings',
      buttons: [
        {
          id: 'h1',
          icon: <Heading1 size={15} />,
          label: 'Heading 1',
          action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: editor.isActive('heading', { level: 1 }),
        },
        {
          id: 'h2',
          icon: <Heading2 size={15} />,
          label: 'Heading 2',
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: editor.isActive('heading', { level: 2 }),
        },
        {
          id: 'h3',
          icon: <Heading3 size={15} />,
          label: 'Heading 3',
          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: editor.isActive('heading', { level: 3 }),
        },
      ],
    },
    {
      id: 'marks',
      buttons: [
        {
          id: 'bold',
          icon: <Bold size={15} />,
          label: 'Bold (Ctrl+B)',
          action: () => editor.chain().focus().toggleBold().run(),
          isActive: editor.isActive('bold'),
        },
        {
          id: 'italic',
          icon: <Italic size={15} />,
          label: 'Italic (Ctrl+I)',
          action: () => editor.chain().focus().toggleItalic().run(),
          isActive: editor.isActive('italic'),
        },
        {
          id: 'underline',
          icon: <UnderlineIcon size={15} />,
          label: 'Underline (Ctrl+U)',
          action: () => editor.chain().focus().toggleUnderline().run(),
          isActive: editor.isActive('underline'),
        },
        {
          id: 'strike',
          icon: <Strikethrough size={15} />,
          label: 'Strikethrough',
          action: () => editor.chain().focus().toggleStrike().run(),
          isActive: editor.isActive('strike'),
        },
        {
          id: 'highlight',
          icon: <Highlighter size={15} />,
          label: 'Highlight',
          action: () => editor.chain().focus().toggleHighlight().run(),
          isActive: editor.isActive('highlight'),
        },
      ],
    },
    {
      id: 'lists',
      buttons: [
        {
          id: 'ul',
          icon: <List size={15} />,
          label: 'Bullet List',
          action: () => editor.chain().focus().toggleBulletList().run(),
          isActive: editor.isActive('bulletList'),
        },
        {
          id: 'ol',
          icon: <ListOrdered size={15} />,
          label: 'Numbered List',
          action: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: editor.isActive('orderedList'),
        },
        {
          id: 'quote',
          icon: <Quote size={15} />,
          label: 'Blockquote',
          action: () => editor.chain().focus().toggleBlockquote().run(),
          isActive: editor.isActive('blockquote'),
        },
        {
          id: 'hr',
          icon: <Minus size={15} />,
          label: 'Horizontal Rule',
          action: () => editor.chain().focus().setHorizontalRule().run(),
        },
      ],
    },
    {
      id: 'align',
      buttons: [
        {
          id: 'align-left',
          icon: <AlignLeft size={15} />,
          label: 'Align Left',
          action: () => editor.chain().focus().setTextAlign('left').run(),
          isActive: editor.isActive({ textAlign: 'left' }),
        },
        {
          id: 'align-center',
          icon: <AlignCenter size={15} />,
          label: 'Align Center',
          action: () => editor.chain().focus().setTextAlign('center').run(),
          isActive: editor.isActive({ textAlign: 'center' }),
        },
        {
          id: 'align-right',
          icon: <AlignRight size={15} />,
          label: 'Align Right',
          action: () => editor.chain().focus().setTextAlign('right').run(),
          isActive: editor.isActive({ textAlign: 'right' }),
        },
      ],
    },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-subtle)',
        flexWrap: 'wrap',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {groups.map((group, gi) => (
        <div key={group.id} style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
          {gi > 0 && (
            <div
              style={{
                width: '1px',
                height: '20px',
                backgroundColor: 'var(--color-border)',
                margin: '0 0.25rem',
              }}
            />
          )}
          {group.buttons.map((btn) => (
            <button
              key={btn.id}
              id={`toolbar-${btn.id}`}
              onClick={btn.action}
              disabled={btn.disabled}
              title={btn.label}
              aria-label={btn.label}
              aria-pressed={btn.isActive}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: btn.disabled ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)',
                backgroundColor: btn.isActive
                  ? 'var(--color-blue-600)'
                  : 'transparent',
                color: btn.isActive
                  ? '#fff'
                  : btn.disabled
                  ? 'var(--color-text-disabled)'
                  : 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!btn.isActive && !btn.disabled) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    'var(--color-surface)';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'var(--color-text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!btn.isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = btn.disabled
                    ? 'var(--color-text-disabled)'
                    : 'var(--color-text-secondary)';
                }
              }}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
