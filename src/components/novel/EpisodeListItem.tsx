import { Link } from 'react-router-dom';
import { Edit3, Trash2, Eye, EyeOff, Brain } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Episode } from '../../types/episode';

interface EpisodeListItemProps {
  episode: Episode;
  index: number;
  novelId: string;
  onDelete?: (id: string) => void;
  mode?: 'writer' | 'reader';
}

export function EpisodeListItem({ episode, index, novelId, onDelete, mode = 'writer' }: EpisodeListItemProps) {
  const aiPending = episode.aiEnrichmentStatus !== 'completed';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-subtle)',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border-strong)';
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-bg-elevated)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)';
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-bg-subtle)';
      }}
    >
      {/* Left: index + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: 'var(--color-blue-600)',
            minWidth: '24px',
            textAlign: 'right',
          }}
        >
          {index}
        </span>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: 'var(--color-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {episode.title}
          </p>
          {aiPending && mode === 'writer' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                color: 'var(--color-purple-500)',
                marginTop: '0.1rem',
              }}
            >
              <Brain size={11} />
              AI enrichment: {episode.aiEnrichmentStatus}
            </span>
          )}
        </div>
      </div>

      {/* Right: badges + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {mode === 'writer' && (
          episode.isPublished ? (
            <Badge variant="green" icon={<Eye size={11} />}>Published</Badge>
          ) : (
            <Badge variant="gray" icon={<EyeOff size={11} />}>Draft</Badge>
          )
        )}

        {mode === 'writer' ? (
          <>
            <Link to={`/writer/novel/${novelId}/episode/${episode.id}`}>
              <Button
                variant="ghost"
                size="sm"
                icon
                leftIcon={<Edit3 size={14} />}
                id={`edit-ep-${episode.id}`}
                aria-label="Edit episode"
              />
            </Link>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                icon
                leftIcon={<Trash2 size={14} />}
                onClick={() => onDelete(episode.id)}
                id={`delete-ep-${episode.id}`}
                aria-label="Delete episode"
              />
            )}
          </>
        ) : (
          <Link to={`/read/${novelId}/${episode.id}`}>
            <Button variant="ghost" size="sm" id={`read-ep-${episode.id}`}>
              Read →
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
