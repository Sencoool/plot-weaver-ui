import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Trash2, BookOpen, ArrowLeft, ChevronDown, ChevronRight, Edit3 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { Textarea } from '../components/ui/Input';
import { useNovelStore } from '../store/novelStore';
import { useEpisodeStore } from '../store/episodeStore';
import { useUiStore } from '../store/uiStore';
import { novelService } from '../services/novelService';
import type { Character, WorldBuilding } from '../types/novel';

export default function NovelEditor() {
  const { id: novelId = '' } = useParams<{ id: string }>();
  const { activeNovel, fetchNovel, updateNovel } = useNovelStore();
  const { episodes, fetchEpisodes, createEpisode, deleteEpisode } = useEpisodeStore();
  const { addToast } = useUiStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Novel metadata form
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<'draft' | 'unpublished' | 'published'>('draft');
  const [tags, setTags] = useState('');

  // Lore panel
  const [loreOpen, setLoreOpen] = useState(false);
  const [plotOutline, setPlotOutline] = useState('');
  const [writingStyle, setWritingStyle] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [worldSetting, setWorldSetting] = useState('');

  // Episode modal
  const [newEpTitle, setNewEpTitle] = useState('');
  const [createEpOpen, setCreateEpOpen] = useState(false);
  const [isCreatingEp, setIsCreatingEp] = useState(false);

  useEffect(() => {
    Promise.all([fetchNovel(novelId), fetchEpisodes(novelId)]).finally(() =>
      setIsLoading(false),
    );
  }, [novelId, fetchNovel, fetchEpisodes]);

  // Sync form from loaded novel
  useEffect(() => {
    if (!activeNovel) return;
    setTitle(activeNovel.title);
    setSummary(activeNovel.summary ?? '');
    setStatus(activeNovel.status);
    setTags(activeNovel.tags.map((t) => t.tag.name).join(', '));
    // Context
    const ctx = activeNovel.context;
    if (ctx) {
      setPlotOutline(ctx.plotOutline ?? '');
      setWritingStyle(ctx.writingStyle ?? '');
      setCharacters(ctx.characters ?? []);
      setWorldSetting(ctx.worldBuilding?.setting ?? '');
    }
  }, [activeNovel]);

  const handleSaveNovel = async () => {
    setIsSaving(true);
    try {
      await updateNovel(novelId, {
        title,
        summary: summary || undefined,
        status,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      addToast({ type: 'success', title: 'Novel saved!' });
    } catch {
      addToast({ type: 'error', title: 'Failed to save novel' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLore = async () => {
    try {
      await novelService.upsertContext(novelId, {
        plotOutline: plotOutline || undefined,
        writingStyle: writingStyle || undefined,
        characters,
        worldBuilding: { setting: worldSetting || undefined },
      });
      addToast({ type: 'success', title: 'Story context saved!' });
    } catch {
      addToast({ type: 'error', title: 'Failed to save context' });
    }
  };

  const handleCreateEpisode = async () => {
    if (!newEpTitle.trim()) return;
    setIsCreatingEp(true);
    try {
      const ep = await createEpisode(novelId, { title: newEpTitle.trim(), content: '' });
      setCreateEpOpen(false);
      setNewEpTitle('');
      addToast({ type: 'success', title: 'Episode created!' });
      // Navigate to editor
      window.location.href = `/writer/novel/${novelId}/episode/${ep.id}`;
    } catch {
      addToast({ type: 'error', title: 'Failed to create episode' });
    } finally {
      setIsCreatingEp(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '3rem', maxWidth: '900px' }}>
      {/* Back */}
      <Link to="/writer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }} id="back-to-dashboard">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Novel metadata card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '1.5rem' }}>
          Novel Settings
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input label="Title" id="novel-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your novel's title" />
          <Textarea label="Summary" id="novel-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A brief description of your novel…" rows={4} />

          {/* Status */}
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
              Status
            </label>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              {(['draft', 'unpublished', 'published'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{
                    padding: '0.375rem 0.875rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid',
                    borderColor: status === s ? 'var(--color-blue-600)' : 'var(--color-border)',
                    backgroundColor: status === s ? 'var(--color-blue-50)' : 'transparent',
                    color: status === s ? 'var(--color-blue-700)' : 'var(--color-text-secondary)',
                    fontWeight: status === s ? 600 : 400,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Input label="Tags (comma-separated)" id="novel-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="fantasy, adventure, romance" hint="These help readers discover your novel" />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" onClick={handleSaveNovel} loading={isSaving} id="save-novel-btn">
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Lore / AI Context Panel */}
      <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
        <button
          onClick={() => setLoreOpen((o) => !o)}
          id="lore-toggle"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '1.25rem 2rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🧠 AI Story Context
            <Badge variant="purple">Used by AI when writing</Badge>
          </span>
          {loreOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        {loreOpen && (
          <div style={{ padding: '0 2rem 2rem', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
              This context is used by the AI when generating content. The more detail you provide, the better the AI understands your world.
            </p>
            <Textarea label="Plot Outline" id="lore-plot" value={plotOutline} onChange={(e) => setPlotOutline(e.target.value)} placeholder="Main story arc, key events, turning points…" rows={4} hint="Max 5000 characters" />
            <Textarea label="Writing Style" id="lore-style" value={writingStyle} onChange={(e) => setWritingStyle(e.target.value)} placeholder="E.g., third-person omniscient, literary fiction style, dark and suspenseful tone…" rows={3} hint="Max 1000 characters" />
            <Input label="World Setting" id="lore-world" value={worldSetting} onChange={(e) => setWorldSetting(e.target.value)} placeholder="E.g., medieval fantasy kingdom, futuristic cyberpunk city 2187…" />

            {/* Characters */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                  Characters
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  onClick={() => setCharacters((c) => [...c, { name: '', role: 'other', description: '' }])}
                  id="add-character-btn"
                >
                  Add Character
                </Button>
              </div>
              {characters.map((char, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.625rem', alignItems: 'flex-start' }}>
                  <Input
                    placeholder="Name"
                    value={char.name}
                    onChange={(e) => {
                      const updated = [...characters];
                      updated[i] = { ...updated[i], name: e.target.value };
                      setCharacters(updated);
                    }}
                  />
                  <select
                    value={char.role}
                    onChange={(e) => {
                      const updated = [...characters];
                      updated[i] = { ...updated[i], role: e.target.value as Character['role'] };
                      setCharacters(updated);
                    }}
                    className="input"
                    style={{ width: '150px', flexShrink: 0 }}
                  >
                    <option value="protagonist">Protagonist</option>
                    <option value="antagonist">Antagonist</option>
                    <option value="supporting">Supporting</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    onClick={() => setCharacters((c) => c.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '0.5rem', flexShrink: 0 }}
                    aria-label="Remove character"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="ai" onClick={handleSaveLore} id="save-lore-btn">
                Save Context
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Episodes list */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Episodes ({episodes.length})
          </h2>
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setCreateEpOpen(true)} id="add-episode-btn">
            Add Episode
          </Button>
        </div>

        {episodes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            <BookOpen size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No episodes yet. Create your first one!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {episodes.map((ep, i) => (
              <div
                key={ep.id}
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
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', minWidth: '24px' }}>
                    {i + 1}
                  </span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                      {ep.title}
                    </p>
                    {ep.aiEnrichmentStatus !== 'completed' && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        AI: {ep.aiEnrichmentStatus}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {ep.isPublished ? (
                    <Badge variant="green">Published</Badge>
                  ) : (
                    <Badge variant="gray">Draft</Badge>
                  )}
                  <Link to={`/writer/novel/${novelId}/episode/${ep.id}`}>
                    <Button variant="ghost" size="sm" icon leftIcon={<Edit3 size={14} />} id={`edit-ep-${ep.id}`} aria-label="Edit episode" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon
                    leftIcon={<Trash2 size={14} />}
                    onClick={async () => {
                      await deleteEpisode(ep.id);
                      addToast({ type: 'success', title: 'Episode deleted' });
                    }}
                    id={`delete-ep-${ep.id}`}
                    aria-label="Delete episode"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Episode Modal */}
      <Modal
        isOpen={createEpOpen}
        onClose={() => { setCreateEpOpen(false); setNewEpTitle(''); }}
        title="Create New Episode"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setCreateEpOpen(false); setNewEpTitle(''); }} id="create-ep-cancel">Cancel</Button>
            <Button variant="primary" onClick={handleCreateEpisode} loading={isCreatingEp} disabled={!newEpTitle.trim()} id="create-ep-confirm">
              Create & Edit
            </Button>
          </>
        }
      >
        <Input
          label="Episode title"
          id="new-episode-title"
          value={newEpTitle}
          onChange={(e) => setNewEpTitle(e.target.value)}
          placeholder="Chapter 1: The Beginning…"
          onKeyDown={(e) => e.key === 'Enter' && handleCreateEpisode()}
          autoFocus
        />
      </Modal>
    </div>
  );
}
