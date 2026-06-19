import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowLeft } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useNovelStore } from '../store/novelStore';
import { useEpisodeStore } from '../store/episodeStore';

export default function NovelDetails() {
  const { id = '' } = useParams<{ id: string }>();
  const { activeNovel, fetchNovel, isLoading } = useNovelStore();
  const { episodes, fetchEpisodes } = useEpisodeStore();

  useEffect(() => {
    fetchNovel(id);
    fetchEpisodes(id);
  }, [id, fetchNovel, fetchEpisodes]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (!activeNovel) {
    return (
      <div className="page-container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-text-primary)' }}>Novel not found</h2>
        <Link to="/discover"><Button variant="secondary" style={{ marginTop: '1rem' }}>Browse Stories</Button></Link>
      </div>
    );
  }

  const publishedEpisodes = episodes.filter((e) => e.isPublished);

  return (
    <div className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem', maxWidth: '800px' }}>
      <Link to="/discover" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        <ArrowLeft size={14} /> Back to Discover
      </Link>

      {/* Novel header */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', flex: 1 }}>
            {activeNovel.title}
          </h1>
          {activeNovel.status === 'published' && <Badge variant="green">Published</Badge>}
        </div>

        {activeNovel.summary && (
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem', fontSize: '1.0625rem' }}>
            {activeNovel.summary}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {activeNovel.tags.map(({ tag }) => (
            <Badge key={tag.id} variant="blue">{tag.name}</Badge>
          ))}
        </div>
      </div>

      {/* Episodes */}
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>
          <BookOpen size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Episodes ({publishedEpisodes.length})
        </h2>

        {publishedEpisodes.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            No episodes published yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {publishedEpisodes.map((ep, i) => (
              <Link
                key={ep.id}
                to={`/read/${id}/${ep.id}`}
                style={{ textDecoration: 'none' }}
                id={`read-ep-${ep.id}`}
              >
                <div
                  className="card card-hover"
                  style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-blue-600)', fontSize: '0.875rem', minWidth: '2rem' }}>
                      {i + 1}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9375rem' }}>
                      {ep.title}
                    </span>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    <Clock size={13} />
                    {new Date(ep.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
