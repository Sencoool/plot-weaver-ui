import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, Sparkles, CheckCircle, AlertCircle,
  Upload, Eye, EyeOff,
} from 'lucide-react';
import { TiptapEditor } from '../components/editor/TiptapEditor';
import { AiPanel } from '../components/ai/AiPanel';
import { Modal } from '../components/ui/Modal';
import { ToastContainer } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { useEpisodeStore } from '../store/episodeStore';
import { useAiStore } from '../store/aiStore';
import { useUiStore } from '../store/uiStore';
import { useDebounce } from '../hooks/useDebounce';
import { episodeService } from '../services/episodeService';
import type { Editor } from '@tiptap/react';

const AUTOSAVE_DELAY = 2500; // 2.5s after last keystroke

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  const map = {
    idle: null,
    saving: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
        <Spinner size={14} /> Saving…
      </span>
    ),
    saved: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-success)', fontSize: '0.8125rem' }}>
        <CheckCircle size={14} /> Saved
      </span>
    ),
    error: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-danger)', fontSize: '0.8125rem' }}>
        <AlertCircle size={14} /> Save failed
      </span>
    ),
  };
  return map[status] ?? null;
}

export default function EpisodeEditor() {
  const { novelId = '', episodeId = '' } = useParams<{ novelId: string; episodeId: string }>();
  const navigate = useNavigate();
  const isNew = episodeId === 'new';

  const [editor, setEditor] = useState<Editor | null>(null);

  const { activeEpisode, fetchEpisode, setActiveEpisode } = useEpisodeStore();
  const { openPanel, isPanelOpen } = useAiStore();
  const { addToast } = useUiStore();

  const [title, setTitle] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load existing episode
  useEffect(() => {
    if (!isNew && episodeId) {
      setIsLoading(true);
      fetchEpisode(episodeId)
        .then(() => setIsLoading(false))
        .catch(() => {
          setIsLoading(false);
          addToast({ type: 'error', title: 'Failed to load episode' });
        });
    } else {
      setActiveEpisode(null);
    }
  }, [episodeId, isNew, fetchEpisode, setActiveEpisode, addToast]);

  // Populate form from loaded episode
  useEffect(() => {
    if (activeEpisode) {
      setTitle(activeEpisode.title);
      setIsPublished(activeEpisode.isPublished);
    }
  }, [activeEpisode]);

  // Autosave — debounced
  const performSave = useCallback(
    async (html: string) => {
      if (isNew || !episodeId || !title.trim()) return;
      setSaveStatus('saving');
      try {
        await episodeService.update(episodeId, { content: html, title });
        setSaveStatus('saved');
        // Reset to idle after 3s
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch {
        setSaveStatus('error');
      }
    },
    [isNew, episodeId, title],
  );

  const debouncedSave = useDebounce(performSave, AUTOSAVE_DELAY);

  const handleEditorChange = useCallback(
    (html: string) => {
      if (!isNew) debouncedSave(html);
    },
    [isNew, debouncedSave],
  );

  // Manual save (for new episodes)
  const handleManualSave = async () => {
    if (!title.trim()) {
      addToast({ type: 'warning', title: 'Title required', message: 'Please enter an episode title before saving.' });
      return;
    }

    const content = editor?.getHTML() ?? '';

    setIsSaving(true);
    try {
      if (isNew) {
        const created = await episodeService.create(novelId, {
          title: title.trim(),
          content,
          isPublished,
        });
        addToast({ type: 'success', title: 'Episode created!' });
        navigate(`/writer/novel/${novelId}/episode/${created.id}`, { replace: true });
      } else {
        await episodeService.update(episodeId, {
          title: title.trim(),
          content,
          isPublished,
        });
        setSaveStatus('saved');
        addToast({ type: 'success', title: 'Episode saved!' });
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch {
      addToast({ type: 'error', title: 'Save failed', message: 'Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // .txt upload handler
  const handleUpload = async (choice: 'keep' | 'ai') => {
    if (!uploadFile) return;
    setIsUploading(true);
    try {
      const result = await episodeService.uploadContent(novelId, uploadFile, title || uploadFile.name.replace('.txt', ''));
      setTitle(result.title);
      if (choice === 'ai') {
        // Navigate to the new episode and open AI panel
        navigate(`/writer/novel/${novelId}/episode/${result.id}`, { replace: true });
        openPanel();
        addToast({ type: 'info', title: 'File uploaded — AI enrichment running in background', duration: 6000 });
      } else {
        navigate(`/writer/novel/${novelId}/episode/${result.id}`, { replace: true });
        addToast({ type: 'success', title: 'Episode created from file!' });
      }
    } catch {
      addToast({ type: 'error', title: 'Upload failed' });
    } finally {
      setIsUploading(false);
      setUploadModalOpen(false);
      setUploadFile(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)',
          backgroundColor: 'var(--color-bg-base)',
        }}
      >
        {/* Editor Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-elevated)',
            flexShrink: 0,
          }}
        >
          {/* Back button */}
          <Link to={`/writer/novel/${novelId}`} aria-label="Back to novel" id="episode-back-btn">
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={16} />
            </button>
          </Link>

          {/* Title input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Episode Title"
            id="episode-title-input"
            style={{
              flex: 1,
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              background: 'none',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          />

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
            {/* Save status */}
            <SaveStatusIndicator status={saveStatus} />

            {/* Publish toggle */}
            <button
              onClick={() => setIsPublished((p) => !p)}
              id="episode-publish-toggle"
              title={isPublished ? 'Published — click to unpublish' : 'Draft — click to publish'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: isPublished ? 'var(--color-success)' : 'var(--color-border)',
                backgroundColor: isPublished ? 'var(--color-success-bg)' : 'transparent',
                color: isPublished ? 'var(--color-success)' : 'var(--color-text-muted)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
              {isPublished ? 'Published' : 'Draft'}
            </button>

            {/* Upload .txt */}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Upload size={14} />}
              onClick={() => setUploadModalOpen(true)}
              id="episode-upload-btn"
            >
              Import .txt
            </Button>

            {/* AI Assistant */}
            <Button
              variant="ai"
              size="sm"
              leftIcon={<Sparkles size={14} />}
              onClick={openPanel}
              id="episode-ai-btn"
            >
              AI Write
            </Button>

            {/* Manual save */}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save size={14} />}
              loading={isSaving}
              onClick={handleManualSave}
              id="episode-save-btn"
            >
              {isNew ? 'Create' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Editor area */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <TiptapEditor
            content={activeEpisode?.content ?? ''}
            onChange={handleEditorChange}
            onEditorReady={setEditor}
            placeholder="Begin your story here… Let the words flow across the page."
            className="h-full"
          />
        </div>
      </div>

      {/* AI Panel — outside main layout flow */}
      {isPanelOpen && (
        <AiPanel
          novelId={novelId}
          episodeId={isNew ? undefined : episodeId}
          editor={editor}
        />
      )}

      {/* .txt Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => { setUploadModalOpen(false); setUploadFile(null); }}
        title="Import .txt File"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Upload a <strong>.txt</strong> file to create a new episode. Choose how to handle the content:
          </p>

          {/* File input */}
          <label
            htmlFor="txt-upload-input"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '1.5rem',
              border: '2px dashed var(--color-border-strong)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              backgroundColor: uploadFile ? 'var(--color-bg-subtle)' : 'transparent',
              gap: '0.5rem',
            }}
          >
            <Upload size={24} style={{ color: 'var(--color-blue-500)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
              {uploadFile ? uploadFile.name : 'Click to select .txt file'}
            </span>
            {uploadFile && (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {(uploadFile.size / 1024).toFixed(1)} KB
              </span>
            )}
            <input
              id="txt-upload-input"
              type="file"
              accept=".txt"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              style={{ display: 'none' }}
            />
          </label>

          {uploadFile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Option 1: Keep original */}
              <button
                onClick={() => handleUpload('keep')}
                disabled={isUploading}
                id="upload-keep-btn"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-elevated)',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => { if (!isUploading) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-strong)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; }}
              >
                <div style={{ fontSize: '1.5rem' }}>📄</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    Keep Original Text
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    Import the file content exactly as-is into the editor.
                  </p>
                </div>
              </button>

              {/* Option 2: AI Generate */}
              <button
                onClick={() => handleUpload('ai')}
                disabled={isUploading}
                id="upload-ai-btn"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid transparent',
                  background: 'linear-gradient(var(--color-bg-elevated), var(--color-bg-elevated)) padding-box, linear-gradient(135deg, var(--color-blue-600), var(--color-purple-600)) border-box',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
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
                    Use this file as a seed. Open AI panel to enhance and rewrite with AI context.
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
        </div>
      </Modal>

      {/* Global toasts for this layout */}
      <ToastContainer />
    </>
  );
}
