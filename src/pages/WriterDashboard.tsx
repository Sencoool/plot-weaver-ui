import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Trash2, Edit3, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Card } from '../components/ui/Badge';
import { useNovelStore } from '../store/novelStore';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

const STATUS_BADGE: Record<string, { label: string; variant: 'blue' | 'green' | 'gray' }> = {
  draft: { label: 'Draft', variant: 'gray' },
  unpublished: { label: 'Unpublished', variant: 'blue' },
  published: { label: 'Published', variant: 'green' },
};

export default function WriterDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { novels, isLoading, fetchNovels, createNovel, deleteNovel } = useNovelStore();
  const { addToast, openModal, closeModal, activeModal } = useUiStore();

  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchNovels({ authorId: user.id });
    }
  }, [user?.id, fetchNovels]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      const novel = await createNovel({ title: newTitle.trim() });
      closeModal();
      setNewTitle('');
      addToast({ type: 'success', title: 'Novel created!', message: novel.title });
      navigate(`/writer/novel/${novel.id}`);
    } catch {
      addToast({ type: 'error', title: 'Failed to create novel' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNovel(deleteTarget);
      addToast({ type: 'success', title: 'Novel deleted' });
    } catch {
      addToast({ type: 'error', title: 'Failed to delete novel' });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
            My Novels
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
            {novels.length} {novels.length === 1 ? 'novel' : 'novels'} in your workspace
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => openModal('create-novel')}
          id="create-novel-btn"
        >
          New Novel
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Spinner size={32} />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && novels.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <BookOpen size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
            No novels yet
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            Start your first novel and let AI help you write it.
          </p>
          <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => openModal('create-novel')} id="empty-create-btn">
            Create First Novel
          </Button>
        </div>
      )}

      {/* Novel grid */}
      {!isLoading && novels.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {novels.map((novel) => {
            const s = STATUS_BADGE[novel.status] ?? STATUS_BADGE.draft;
            return (
              <Card
                key={novel.id}
                hover
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
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
                    {novel.title}
                  </h3>
                  <Badge variant={s.variant}>{s.label}</Badge>
                </div>

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
                    {novel.tags.sort((a, b) => a.tag.name.localeCompare(b.tag.name)).slice(0, 3).map(({ tag }) => (
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
                  </div>
                )}

                {/* Meta + actions */}
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
                    <Clock size={13} />
                    {novel._count?.episodes ?? 0} episodes
                  </span>

                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon
                      leftIcon={<Trash2 size={14} />}
                      onClick={() => setDeleteTarget(novel.id)}
                      id={`delete-novel-${novel.id}`}
                      aria-label={`Delete ${novel.title}`}
                    />
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
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Novel Modal */}
      <Modal
        isOpen={activeModal === 'create-novel'}
        onClose={() => { closeModal(); setNewTitle(''); }}
        title="Create New Novel"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { closeModal(); setNewTitle(''); }} id="create-modal-cancel">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              loading={isCreating}
              disabled={!newTitle.trim()}
              id="create-modal-confirm"
            >
              Create Novel
            </Button>
          </>
        }
      >
        <Input
          label="Novel title"
          id="new-novel-title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter a compelling title…"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          autoFocus
        />
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Novel"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} id="delete-cancel">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} id="delete-confirm">
              Delete Permanently
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
          This will permanently delete this novel and all its episodes. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
