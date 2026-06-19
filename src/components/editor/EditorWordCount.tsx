import type { Editor } from '@tiptap/react';

interface EditorWordCountProps {
  editor: Editor;
}

export function EditorWordCount({ editor }: EditorWordCountProps) {
  const charCount = editor.storage.characterCount?.characters?.() ?? 0;
  const wordCount = editor.storage.characterCount?.words?.() ?? 0;

  return (
    <div
      aria-label="Word and character count"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.375rem 1rem',
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-subtle)',
        fontSize: '0.75rem',
        color: 'var(--color-text-muted)',
        flexShrink: 0,
      }}
    >
      <span>
        <strong style={{ color: 'var(--color-text-secondary)' }}>
          {wordCount.toLocaleString()}
        </strong>{' '}
        words
      </span>
      <span>
        <strong style={{ color: 'var(--color-text-secondary)' }}>
          {charCount.toLocaleString()}
        </strong>{' '}
        characters
      </span>
    </div>
  );
}
