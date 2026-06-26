import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, Sparkles, CheckCircle, AlertCircle,
  Upload, Eye, EyeOff,
} from 'lucide-react';
import { TiptapEditor } from '../components/editor/TiptapEditor';
import { AiPanel } from '../components/ai/AiPanel';
import { TxtUploadModal } from '../components/novel/TxtUploadModal';
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

  // Called by TxtUploadModal after successful upload
  const handleUploaded = (episodeId: string, openAi?: boolean) => {
    navigate(`/writer/novel/${novelId}/episode/${episodeId}`, { replace: true });
    if (openAi) openPanel();
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
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
          padding: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            maxWidth: '1400px',
            gap: '1.5rem',
          }}
        >
          {/* Left Column */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {/* Header Row (Title & Controls) hovering above the box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <Link to={`/writer/novel/${novelId}`} aria-label="Back to novel" id="episode-back-btn">
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border-strong)',
                    backgroundColor: 'var(--color-bg-base)',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    flexShrink: 0,
                  }}
                >
                  <ArrowLeft size={16} />
                </button>
              </Link>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Episode Title"
                id="episode-title-input"
                style={{
                  flex: 1,
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
                <SaveStatusIndicator status={saveStatus} />
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
                    backgroundColor: isPublished ? 'var(--color-success-bg)' : 'var(--color-bg-base)',
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
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Upload size={14} />}
                  onClick={() => setUploadModalOpen(true)}
                  id="episode-upload-btn"
                >
                  Import .txt
                </Button>
                <Button
                  variant="ai"
                  size="sm"
                  leftIcon={<Sparkles size={14} />}
                  onClick={openPanel}
                  id="episode-ai-btn"
                >
                  AI Write
                </Button>
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

            {/* Editor Box */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--color-bg-base)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                minHeight: '600px',
                height: 'calc(100vh - 160px)',
              }}
            >
              <TiptapEditor
                content={activeEpisode?.content ?? ''}
                onChange={handleEditorChange}
                onEditorReady={setEditor}
                placeholder="Begin your story here… Let the words flow across the page."
                className="h-full"
              />
            </div>
          </div>

          {/* Right Column: AI Panel */}
          {isPanelOpen && (
            <div
              style={{
                width: '380px',
                marginTop: '2.5rem', // Aligns top of AI box with top of Editor box
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--color-bg-base)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                animation: 'slide-in-right var(--transition-normal) ease-out',
                minHeight: '600px',
                height: 'calc(100vh - 160px)',
              }}
            >
              <AiPanel
                novelId={novelId}
                episodeId={isNew ? undefined : episodeId}
                editor={editor}
              />
            </div>
          )}
        </div>
      </div>

      {/* .txt Upload Modal — extracted component */}
      <TxtUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        novelId={novelId}
        onUploaded={handleUploaded}
      />

      {/* Global toasts for this layout */}
      <ToastContainer />
    </>
  );
}
