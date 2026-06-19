interface AiStreamOutputProps {
  text: string;
  isStreaming?: boolean;
}

export function AiStreamOutput({ text, isStreaming = false }: AiStreamOutputProps) {
  return (
    <div
      aria-live="polite"
      aria-label="AI generated text"
      style={{
        padding: '1rem',
        backgroundColor: 'var(--color-bg-subtle)',
        border: '1px solid var(--color-border-strong)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.9rem',
        lineHeight: 1.75,
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-serif)',
        maxHeight: '40vh',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {text}
      {isStreaming && <span className="streaming-cursor" aria-hidden="true" />}
    </div>
  );
}
