import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Textarea } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EpisodeListItem } from '../components/novel/EpisodeListItem';
import { CreateEpisodeModal } from '../components/novel/CreateEpisodeModal';
import { NovelContextPanel } from '../components/novel/NovelContextPanel';
import { useNovelStore } from '../store/novelStore';
import { useEpisodeStore } from '../store/episodeStore';
import { useUiStore } from '../store/uiStore';
import { novelService } from '../services/novelService';
import type { Character } from '../types/novel';

export default function NovelEditor() {
  const { id: novelId = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeNovel, fetchNovel, updateNovel } = useNovelStore();
  const { episodes, fetchEpisodes, createEpisode, deleteEpisode } = useEpisodeStore();
  const { addToast } = useUiStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingLore, setIsSavingLore] = useState(false);

  // Novel metadata form
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<'draft' | 'unpublished' | 'published'>('draft');
  const [tags, setTags] = useState('');

  // Lore panel state
  const [plotOutline, setPlotOutline] = useState('');
  const [writingStyle, setWritingStyle] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [worldSetting, setWorldSetting] = useState('');

  // Episode modal
  const [createEpOpen, setCreateEpOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchNovel(novelId), fetchEpisodes(novelId)]).finally(() =>
      setIsLoading(false),
    );
  }, [novelId, fetchNovel, fetchEpisodes]);

  // Sync form from loaded novel
  useEffect(() => {
    if (!activeNovel) return;
    console.log(activeNovel.context)
    setTitle(activeNovel.title);
    setSummary(activeNovel.summary ?? '');
    setStatus(activeNovel.status);
    setTags(activeNovel.tags.map((t) => t.tag.name).join(', '));
    const ctx = activeNovel.context;
    if (ctx) {
      setPlotOutline(ctx.plotOutline ?? '');
      setWritingStyle(ctx.writingStyle ?? '');

      let parseCharacters: Character[] = [];
      if (typeof ctx.characters === 'string') {
        try {
          parseCharacters = JSON.parse(ctx.characters);
        } catch (error) {
          parseCharacters = [];
        }
      } else {
        parseCharacters = ctx.characters ?? [];
      }
      setCharacters(parseCharacters);
      setWorldSetting(ctx.worldBuilding ?? '');
    }
  }, [activeNovel]);

  const handleSaveNovel = async () => {
    setIsSaving(true);
    try {
      await updateNovel(novelId, {
        title,
        summary: summary || undefined,
        status,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
      });
      addToast({ type: 'success', title: 'Novel saved!' });
    } catch {
      addToast({ type: 'error', title: 'Failed to save novel' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLore = async () => {
    setIsSavingLore(true);
    try {
      await novelService.upsertContext(novelId, {
        plotOutline: plotOutline || undefined,
        writingStyle: writingStyle || undefined,
        characters,
        worldBuilding: worldSetting || undefined,
      });
      addToast({ type: 'success', title: 'Story context saved!' });
    } catch {
      addToast({ type: 'error', title: 'Failed to save context' });
    } finally {
      setIsSavingLore(false);
    }
  };

  const handleCreateEpisode = async (title: string) => {
    const ep = await createEpisode(novelId, { title, content: '' });
    setCreateEpOpen(false);
    addToast({ type: 'success', title: 'Episode created!' });
    navigate(`/writer/novel/${novelId}/episode/${ep.id}`);
  };

  const handleDeleteEpisode = async (id: string) => {
    try {
      await deleteEpisode(id);
      addToast({ type: 'success', title: 'Episode deleted' });
    } catch {
      addToast({ type: 'error', title: 'Failed to delete episode' });
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
      <Link
        to="/writer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}
        id="back-to-dashboard"
      >
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Input label="Tags (comma-separated)" id="novel-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="fantasy, adventure, romance" hint="These help readers discover your novel" />
            {tags.split(',').map((t) => t.trim()).filter(Boolean).length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {tags.split(',').map((t) => t.trim()).filter(Boolean).map((t, idx) => (
                  <Badge key={idx} variant="blue">{t.charAt(0).toUpperCase() + t.slice(1)}</Badge>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" onClick={handleSaveNovel} loading={isSaving} id="save-novel-btn">
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* AI Story Context Panel — extracted component */}
      <NovelContextPanel
        plotOutline={plotOutline}
        writingStyle={writingStyle}
        worldSetting={worldSetting}
        characters={characters}
        onPlotOutlineChange={setPlotOutline}
        onWritingStyleChange={setWritingStyle}
        onWorldSettingChange={setWorldSetting}
        onCharactersChange={setCharacters}
        onSave={handleSaveLore}
        isSaving={isSavingLore}
      />

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
            <p>No episodes yet. Create your first one!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {episodes.map((ep, i) => (
              <EpisodeListItem
                key={ep.id}
                episode={ep}
                index={i + 1}
                novelId={novelId}
                onDelete={handleDeleteEpisode}
                mode="writer"
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Episode Modal */}
      <CreateEpisodeModal
        isOpen={createEpOpen}
        onClose={() => setCreateEpOpen(false)}
        onCreate={handleCreateEpisode}
      />
    </div>
  );
}
