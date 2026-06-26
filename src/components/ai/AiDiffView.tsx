import { useMemo } from 'react';
import type { DiffToken } from '../../types/ai';

/**
 * Minimal word-level diff algorithm.
 * Produces an array of DiffToken (equal | insert | delete).
 */
function computeWordDiff(original: string, generated: string): DiffToken[] {
  // Strip HTML tags for clean comparison
  const stripHtml = (html: string) =>
    html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();

  const originalWords = stripHtml(original).split(/(\s+)/);
  const generatedWords = stripHtml(generated).split(/(\s+)/);

  // Myers diff — simplified LCS-based approach
  const m = originalWords.length;
  const n = generatedWords.length;

  // Build LCS table
  const lcs: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (originalWords[i - 1] === generatedWords[j - 1]) {
        lcs[i][j] = lcs[i - 1][j - 1] + 1;
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff tokens
  let i = m;
  let j = n;
  const temp: DiffToken[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && originalWords[i - 1] === generatedWords[j - 1]) {
      temp.push({ text: originalWords[i - 1], type: 'equal' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      temp.push({ text: generatedWords[j - 1], type: 'insert' });
      j--;
    } else {
      temp.push({ text: originalWords[i - 1], type: 'delete' });
      i--;
    }
  }

  return temp.reverse();
}

interface AiDiffViewProps {
  original: string;
  generated: string;
}

export function AiDiffView({ original, generated }: AiDiffViewProps) {
  const tokens = useMemo(() => computeWordDiff(original, generated), [original, generated]);

  const hasChanges = tokens.some((t) => t.type !== 'equal');
  const insertCount = tokens.filter((t) => t.type === 'insert').length;
  const deleteCount = tokens.filter((t) => t.type === 'delete').length;

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-diff-add)',
            color: 'var(--color-diff-add-text)',
          }}
        >
          +{insertCount} words added
        </span>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-diff-remove)',
            color: 'var(--color-diff-remove-text)',
          }}
        >
          −{deleteCount} words removed
        </span>
      </div>

      {/* Diff content */}
      <div
        aria-label="Diff comparison"
        style={{
          padding: '1rem',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-bg-elevated)',
          fontSize: '0.9rem',
          lineHeight: 1.8,
          fontFamily: 'var(--font-serif)',
          maxHeight: '35vh',
          overflowY: 'auto',
        }}
      >
        {!hasChanges ? (
          <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            No differences detected.
          </p>
        ) : (
          tokens.map((token, idx) => {
            if (token.type === 'equal') {
              return <span key={idx}>{token.text}</span>;
            }
            if (token.type === 'insert') {
              return (
                <span
                  key={idx}
                  style={{
                    backgroundColor: 'var(--color-diff-add)',
                    color: 'var(--color-diff-add-text)',
                    borderRadius: '2px',
                    padding: '0 2px',
                    fontWeight: 500,
                  }}
                  title="Added"
                >
                  {token.text}
                </span>
              );
            }
            // delete
            return (
              <span
                key={idx}
                style={{
                  backgroundColor: 'var(--color-diff-remove)',
                  color: 'var(--color-diff-remove-text)',
                  borderRadius: '2px',
                  padding: '0 2px',
                  textDecoration: 'line-through',
                  opacity: 0.8,
                }}
                title="Removed"
              >
                {token.text}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}
