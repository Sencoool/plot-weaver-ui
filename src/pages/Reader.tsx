import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, BookOpen } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import { useEpisodeStore } from '../store/episodeStore';
import { useThemeStore } from '../store/themeStore';
import { ToastContainer } from '../components/ui/Toast';

export default function Reader() {
  const { novelId = '', episodeId = '' } = useParams<{ novelId: string; episodeId: string }>();
  const { activeEpisode, fetchEpisode, isLoading } = useEpisodeStore();
  const { mode, toggleTheme } = useThemeStore();
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    fetchEpisode(episodeId);
  }, [episodeId, fetchEpisode]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: mode === 'dark' ? '#0d1321' : '#fafaf8',
        color: mode === 'dark' ? '#e8e6e0' : '#1a1a1a',
        transition: 'all var(--transition-normal)',
      }}
    >
      {/* Reader toolbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          backgroundColor: mode === 'dark' ? 'rgba(13,19,33,0.9)' : 'rgba(250,250,248,0.9)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Link to={`/novel/${novelId}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', textDecoration: 'none', opacity: 0.6 }}>
          <ArrowLeft size={18} />
          <BookOpen size={16} />
          <span style={{ fontSize: '0.875rem' }}>Back to Novel</span>
        </Link>

        <span style={{ fontSize: '0.875rem', opacity: 0.7, fontWeight: 600 }}>
          {activeEpisode?.title ?? ''}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Font size controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => setFontSize((s) => Math.max(14, s - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '0.75rem', opacity: 0.7 }}>A−</button>
            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{fontSize}px</span>
            <button onClick={() => setFontSize((s) => Math.min(26, s + 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1rem', opacity: 0.7 }}>A+</button>
          </div>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', opacity: 0.7 }}
          >
            {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <Spinner size={32} />
        </div>
      ) : !activeEpisode ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>Episode not found.</div>
      ) : (
        <main
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            padding: '3rem 1.5rem 6rem',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '2rem',
              fontWeight: 800,
              marginBottom: '2rem',
              lineHeight: 1.2,
              color: mode === 'dark' ? '#f1f5f9' : '#0f172a',
            }}
          >
            {activeEpisode.title}
          </h1>

          {/* Render HTML content from the Tiptap editor */}
          <div
            className="prose-editor"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.9 }}
            dangerouslySetInnerHTML={{ __html: activeEpisode.content }}
          />
        </main>
      )}

      <ToastContainer />
    </div>
  );
}
