import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { NovelCard } from '../components/novel/NovelCard';
import { useNovelStore } from '../store/novelStore';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

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

      {/* Novel grid — uses NovelCard component */}
      {!isLoading && novels.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {novels.map((novel) => (
            <NovelCard
              key={novel.id}
              novel={novel}
              mode="writer"
              onDelete={(id) => setDeleteTarget(id)}
            />
          ))}
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
