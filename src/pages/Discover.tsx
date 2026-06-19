import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { useNovelStore } from '../store/novelStore';

export default function Discover() {
  const { novels, fetchNovels, isLoading } = useNovelStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchNovels({ status: 'published' });
  }, [fetchNovels]);

  const filtered = novels.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem', maxWidth: '540px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
          Discover Stories
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
          Explore novels written and published by our community of writers.
        </p>
        <Input
          placeholder="Search novels…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
          id="discover-search"
        />
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Spinner size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          <BookOpen size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No published novels yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((novel) => (
            <Link key={novel.id} to={`/novel/${novel.id}`} style={{ textDecoration: 'none' }} id={`novel-card-${novel.id}`}>
              <div className="card card-hover" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div
                  style={{
                    height: '6px',
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(90deg, var(--color-blue-600), var(--color-purple-600))',
                    marginBottom: '1rem',
                  }}
                />
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                  {novel.title}
                </h3>
                {novel.summary && (
                  <p style={{
                    fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, flex: 1,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    marginBottom: '1rem',
                  }}>
                    {novel.summary}
                  </p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: 'auto' }}>
                  {novel.tags.slice(0, 3).map(({ tag }) => (
                    <Badge key={tag.id} variant="blue">{tag.name}</Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
