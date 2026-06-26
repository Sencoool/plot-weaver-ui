import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { episodeService } from '../../services/episodeService';
import { useUiStore } from '../../store/uiStore';

interface TxtUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  novelId: string;
  onUploaded: (episodeId: string, openAi?: boolean) => void;
}

export function TxtUploadModal({ isOpen, onClose, novelId, onUploaded }: TxtUploadModalProps) {
  const { addToast } = useUiStore();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const reset = () => {
    setFile(null);
    setIsUploading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleUpload = async (mode: 'keep' | 'ai') => {
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await episodeService.uploadContent(novelId, file, file.name.replace('.txt', ''));
      addToast({
        type: mode === 'ai' ? 'info' : 'success',
        title: mode === 'ai' ? 'File uploaded — AI enrichment queued' : 'Episode created from file!',
        duration: 5000,
      });
      handleClose();
      onUploaded(result.id, mode === 'ai');
    } catch {
      addToast({ type: 'error', title: 'Upload failed', message: 'Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import .txt File" size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Upload a <strong>.txt</strong> file to create a new episode. Then choose how to handle the content.
        </p>

        {/* Drop zone */}
        <label
          htmlFor="txt-upload-input"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '1.5rem',
            border: `2px dashed ${file ? 'var(--color-blue-400)' : 'var(--color-border-strong)'}`,
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            backgroundColor: file ? 'var(--color-bg-subtle)' : 'transparent',
            gap: '0.5rem',
          }}
        >
          <Upload size={24} style={{ color: 'var(--color-blue-500)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
            {file ? file.name : 'Click to select .txt file'}
          </span>
          {file && (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {(file.size / 1024).toFixed(1)} KB
            </span>
          )}
          <input
            id="txt-upload-input"
            type="file"
            accept=".txt"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ display: 'none' }}
          />
        </label>

        {file && !isUploading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Keep original */}
            <button
              onClick={() => handleUpload('keep')}
              id="upload-keep-btn"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-elevated)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-strong)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; }}
            >
              <div style={{ fontSize: '1.5rem' }}>📄</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                  Keep Original Text
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                  Import content exactly as-is into the editor.
                </p>
              </div>
            </button>

            {/* AI enhance */}
            <button
              onClick={() => handleUpload('ai')}
              id="upload-ai-btn"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid transparent',
                background: 'linear-gradient(var(--color-bg-elevated), var(--color-bg-elevated)) padding-box, linear-gradient(135deg, var(--color-blue-600), var(--color-purple-600)) border-box',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>✨</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                  Generate AI Content
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                  Use this file as a seed and open AI panel to enhance with context.
                </p>
              </div>
            </button>
          </div>
        )}

        {isUploading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            <Spinner size={16} />
            Uploading…
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={handleClose} id="upload-cancel-btn">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
