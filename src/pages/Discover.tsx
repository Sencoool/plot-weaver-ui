import { useEffect, useState } from 'react';
import { Search, BookOpen, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { NovelCard } from '../components/novel/NovelCard';
import { Spinner } from '../components/ui/Spinner';
import { useNovelStore } from '../store/novelStore';

const GENRES = ['All', 'Fantasy', 'Romance', 'Thriller', 'Sci-Fi', 'Horror', 'Historical', 'Mystery'];

export default function Discover() {
  const { novels, fetchNovels, isLoading } = useNovelStore();
  const [search, setSearch] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');

  useEffect(() => {
    fetchNovels({ status: 'published' });
  }, [fetchNovels]);

  const filtered = novels.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
      (n.summary ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesGenre = activeGenre === 'All' ||
      n.tags.some(({ tag }) => tag.name.toLowerCase() === activeGenre.toLowerCase());
    return matchesSearch && matchesGenre;
  });

  return (
    <div style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* Hero banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--color-bg-subtle) 0%, var(--color-bg-base) 100%)',
          borderBottom: '1px solid var(--color-border)',
          padding: '3rem 1.5rem 2.5rem',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <span className="badge badge-purple" style={{ fontSize: '0.8125rem', padding: '0.3rem 0.875rem' }}>
              <TrendingUp size={13} /> Community Stories
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Discover Stories
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.75rem', fontSize: '1.0625rem' }}>
            Explore novels written and published by our community of writers.
          </p>

          {/* Search */}
          <Input
            placeholder="Search by title or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
            id="discover-search"
            style={{ maxWidth: '460px', margin: '0 auto' }}
          />
        </div>
      </section>

      <div className="page-container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        {/* Genre filter chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <SlidersHorizontal size={15} style={{ color: 'var(--color-text-muted)' }} />
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              style={{
                padding: '0.3rem 0.875rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: activeGenre === genre ? 'var(--color-blue-600)' : 'var(--color-border)',
                backgroundColor: activeGenre === genre ? 'var(--color-blue-50)' : 'transparent',
                color: activeGenre === genre ? 'var(--color-blue-700)' : 'var(--color-text-secondary)',
                fontWeight: activeGenre === genre ? 600 : 400,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!isLoading && (
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
            {filtered.length} {filtered.length === 1 ? 'novel' : 'novels'} found
            {search && <> matching "<strong>{search}</strong>"</>}
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <Spinner size={32} />
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <BookOpen size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem', opacity: 0.4 }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
              No stories found
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
              {search ? 'Try a different search term or clear the filter.' : 'No published novels yet — check back soon!'}
            </p>
            {search && (
              <button
                onClick={() => { setSearch(''); setActiveGenre('All'); }}
                style={{ marginTop: '1rem', color: 'var(--color-blue-600)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Novel grid */}
        {!isLoading && filtered.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {filtered.map((novel) => (
              <NovelCard
                key={novel.id}
                novel={novel}
                mode="reader"
                id={`novel-card-${novel.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
