import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface CreateEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => Promise<void>;
}

export function CreateEpisodeModal({ isOpen, onClose, onCreate }: CreateEpisodeModalProps) {
  const [title, setTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsCreating(true);
    try {
      await onCreate(title.trim());
      setTitle('');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Episode"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} id="create-ep-cancel">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            loading={isCreating}
            disabled={!title.trim()}
            id="create-ep-confirm"
          >
            Create &amp; Edit
          </Button>
        </>
      }
    >
      <Input
        label="Episode title"
        id="new-episode-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Chapter 1: The Beginning…"
        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        autoFocus
      />
    </Modal>
  );
}
