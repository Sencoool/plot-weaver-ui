import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Edit3, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Novel } from '../../types/novel';

const STATUS_BADGE: Record<string, { label: string; variant: 'blue' | 'green' | 'gray' }> = {
  draft:       { label: 'Draft',       variant: 'gray'  },
  unpublished: { label: 'Unpublished', variant: 'blue'  },
  published:   { label: 'Published',   variant: 'green' },
};

interface NovelCardProps {
  novel: Novel;
  onDelete?: (id: string) => void;
  /** Writer view shows edit/delete; reader view shows read link */
  mode?: 'writer' | 'reader';
}

export function NovelCard({ novel, onDelete, mode = 'writer' }: NovelCardProps) {
  const s = STATUS_BADGE[novel.status] ?? STATUS_BADGE.draft;

  return (
    <article
      className="card card-hover"
      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
      aria-label={`Novel: ${novel.title}`}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <h3
          style={{
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            lineHeight: 1.35,
            flex: 1,
          }}
        >
          {mode === 'reader' ? (
            <Link to={`/novel/${novel.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {novel.title}
            </Link>
          ) : (
            novel.title
          )}
        </h3>
        <Badge variant={s.variant}>{s.label}</Badge>
      </div>

      {/* Summary */}
      {novel.summary && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {novel.summary}
        </p>
      )}

      {/* Tags */}
      {novel.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {novel.tags.slice(0, 3).map(({ tag }) => (
            <span
              key={tag.id}
              style={{
                fontSize: '0.75rem',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              {tag.name}
            </span>
          ))}
          {novel.tags.length > 3 && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-text-muted)',
              }}
            >
              +{novel.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <BookOpen size={13} />
          {novel._count?.episodes ?? 0} episodes
          <span style={{ marginLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} />
            {new Date(novel.updatedAt).toLocaleDateString()}
          </span>
        </span>

        {mode === 'writer' ? (
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                icon
                leftIcon={<Trash2 size={14} />}
                onClick={() => onDelete(novel.id)}
                id={`delete-novel-${novel.id}`}
                aria-label={`Delete ${novel.title}`}
              />
            )}
            <Link to={`/writer/novel/${novel.id}`}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Edit3 size={14} />}
                id={`edit-novel-${novel.id}`}
              >
                Edit
              </Button>
            </Link>
          </div>
        ) : (
          <Link to={`/novel/${novel.id}`}>
            <Button variant="secondary" size="sm">
              Read →
            </Button>
          </Link>
        )}
      </div>
    </article>
  );
}
