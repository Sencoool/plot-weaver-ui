import { Link } from 'react-router-dom';
import { Clock, BookOpen, Edit3, Trash2, PenLine } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Novel } from '../../types/novel';

const STATUS_BADGE: Record<string, { label: string; variant: 'blue' | 'green' | 'gray' }> = {
  draft:       { label: 'Draft',       variant: 'gray'  },
  unpublished: { label: 'Unpublished', variant: 'blue'  },
  published:   { label: 'Published',   variant: 'green' },
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);
  if (mins < 2) return 'just now';
  if (mins < 60) return mins + ' mins ago';
  if (hours < 24) return hours + ' hr ago';
  if (days === 1) return 'yesterday';
  if (days < 30) return days + ' days ago';
  return new Date(dateStr).toLocaleDateString();
}

interface NovelCardProps {
  novel: Novel;
  onDelete?: (id: string) => void;
  /** Writer view shows edit/delete; reader view shows read link */
  mode?: 'writer' | 'reader';
  id?: string;
}

export function NovelCard({ novel, onDelete, mode = 'writer', id }: NovelCardProps) {
  const s = STATUS_BADGE[novel.status] ?? STATUS_BADGE.draft;
  const episodeCount = novel._count?.episodes ?? 0;

  return (
    <article
      id={id}
      className="card card-hover"
      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
      aria-label={'Novel: ' + novel.title}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <h3
          style={{
            fontSize: '1.0625rem', fontWeight: 700,
            color: 'var(--color-text-primary)', lineHeight: 1.35, flex: 1,
          }}
        >
          {mode === 'reader' ? (
            <Link to={"/novel/" + novel.id} style={{ color: 'inherit', textDecoration: 'none' }}>
              {novel.title}
            </Link>
          ) : novel.title}
        </h3>
        <Badge variant={s.variant}>{s.label}</Badge>
      </div>

      {/* Summary */}
      {novel.summary && (
        <p
          style={{
            fontSize: '0.875rem', color: 'var(--color-text-secondary)',
            lineHeight: 1.6, display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          {novel.summary}
        </p>
      )}

      {/* Tags */}
      {novel.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {novel.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              style={{
                fontSize: '0.75rem', padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              {tag}
            </span>
          ))}
          {novel.tags.length > 3 && (
            <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', color: 'var(--color-text-muted)' }}>
              +{novel.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.875rem',
        padding: '0.5rem 0.75rem',
        backgroundColor: 'var(--color-bg-subtle)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          <BookOpen size={12} />
          {episodeCount} {episodeCount === 1 ? 'episode' : 'episodes'}
        </span>
        <span style={{ width: '1px', height: '12px', backgroundColor: 'var(--color-border)', flexShrink: 0 }} />
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          <Clock size={12} />
          {relativeTime(novel.updatedAt)}
        </span>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', gap: '0.5rem' }}>
        {mode === 'writer' ? (
          <>
            {/* Continue Writing — quick access to the novel's editor */}
            <Link to={"/writer/novel/" + novel.id} style={{ flex: 1 }}>
              <Button
                variant="ai"
                size="sm"
                leftIcon={<PenLine size={13} />}
                id={"continue-novel-" + novel.id}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Continue Writing
              </Button>
            </Link>
            <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon
                  leftIcon={<Trash2 size={14} />}
                  onClick={() => onDelete(novel.id)}
                  id={"delete-novel-" + novel.id}
                  aria-label={"Delete " + novel.title}
                />
              )}
              <Link to={"/writer/novel/" + novel.id}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon
                  leftIcon={<Edit3 size={14} />}
                  id={"edit-novel-" + novel.id}
                  aria-label={"Edit " + novel.title + " settings"}
                  title="Novel settings"
                />
              </Link>
            </div>
          </>
        ) : (
          <Link to={"/novel/" + novel.id}>
            <Button variant="secondary" size="sm">Read →</Button>
          </Link>
        )}
      </div>
    </article>
  );
}
