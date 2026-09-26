import { useCallback, useEffect, useState } from 'react';
import { X, History, RotateCcw, Loader2 } from 'lucide-react';
import { episodeService } from '../../services/episodeService';
import type { EpisodeRevision } from '../../types/episode';

interface RevisionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Undefined while a brand-new episode has no id yet. */
  episodeId?: string;
  /** Called after a successful restore so the editor can show the new text. */
  onRestored: () => void | Promise<void>;
}

/** Editor HTML → a one-line preview. Rendered as text, never as markup. */
function preview(html: string): string {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 150 ? `${text.slice(0, 150)}…` : text;
}

function when(iso: string): string {
  const date = new Date(iso);
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'เมื่อสักครู่';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} ชั่วโมงที่แล้ว`;
  return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
}

export function RevisionHistoryDrawer({
  isOpen,
  onClose,
  episodeId,
  onRestored,
}: RevisionHistoryDrawerProps) {
  const [revisions, setRevisions] = useState<EpisodeRevision[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Which episode the loaded list belongs to — the spinner is derived from it, so
  // nothing is written synchronously inside the effect.
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const isLoading = !!episodeId && loadedFor !== episodeId && !error;

  const load = useCallback(() => {
    if (!episodeId) return Promise.resolve();
    return episodeService
      .getRevisions(episodeId)
      .then((list) => {
        setRevisions(list);
        setError(null);
      })
      .catch(() => setError('โหลดประวัติไม่สำเร็จ'))
      .finally(() => setLoadedFor(episodeId));
  }, [episodeId]);

  useEffect(() => {
    if (isOpen) void load();
  }, [isOpen, load]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleRestore = async (revisionId: string) => {
    if (!episodeId) return;
    setRestoringId(revisionId);
    try {
      await episodeService.restoreRevision(episodeId, revisionId);
      setConfirmingId(null);
      await onRestored();
      // The restore itself wrote a new snapshot, so re-read the list.
      await load();
    } catch {
      setError('กู้คืนไม่สำเร็จ');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <div
        role="dialog"
        aria-label="Episode revision history"
        style={{
          position: 'fixed',
          right: 0,
          top: '64px',
          height: 'calc(100vh - 64px)',
          width: '340px',
          zIndex: 1000,
          backgroundColor: 'var(--color-bg-elevated)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-blue-600))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <History size={13} color="#fff" />
          </div>
          <div>
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}
            >
              ประวัติเวอร์ชัน
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              เก็บอัตโนมัติก่อนการแก้ไขทุกครั้ง (5 ล่าสุด)
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close revision history"
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              display: 'flex',
              padding: '4px',
              borderRadius: '4px',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem' }}>
          {error && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-danger)', marginBottom: '0.75rem' }}>
              {error}
            </p>
          )}

          {isLoading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem',
                gap: '0.5rem',
                color: 'var(--color-text-muted)',
              }}
            >
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> กำลังโหลด…
            </div>
          ) : revisions.length === 0 ? (
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.7,
                padding: '1rem 0.25rem',
              }}
            >
              ยังไม่มีเวอร์ชันที่บันทึกไว้ — จะมีก็ต่อเมื่อเนื้อหาถูกแก้ไขหลังจากบันทึกครั้งแรก
              และระบบจะเก็บสำเนาก่อนการแก้ไขไว้ให้
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {revisions.map((revision) => {
                const isConfirming = confirmingId === revision.id;
                const isRestoring = restoringId === revision.id;
                const text = preview(revision.content);

                return (
                  <div
                    key={revision.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-subtle)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {when(revision.createdAt)}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                        {revision.content.length} ตัวอักษร
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.6,
                        margin: '0.375rem 0 0.625rem',
                      }}
                    >
                      {text || '(ว่าง)'}
                    </p>

                    {isConfirming ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-primary)' }}>
                          กู้คืนเวอร์ชันนี้?
                        </span>
                        <button
                          onClick={() => handleRestore(revision.id)}
                          disabled={isRestoring}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.625rem',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            backgroundColor: 'var(--color-primary)',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: isRestoring ? 'wait' : 'pointer',
                          }}
                        >
                          {isRestoring ? 'กำลังกู้คืน…' : 'ยืนยัน'}
                        </button>
                        <button
                          onClick={() => setConfirmingId(null)}
                          disabled={isRestoring}
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'transparent',
                            color: 'var(--color-text-secondary)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingId(revision.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.25rem 0.625rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border-strong)',
                          backgroundColor: 'transparent',
                          color: 'var(--color-text-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <RotateCcw size={12} />
                        กู้คืน
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
