import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Zap, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';

const FEATURES = [
  {
    icon: <Sparkles size={22} />,
    title: 'AI-Powered Writing',
    desc: 'Generate compelling chapters, fix plot holes, and maintain consistent character voices with Ollama AI.',
    color: 'var(--color-blue-600)',
  },
  {
    icon: <BookOpen size={22} />,
    title: 'RAG Story Memory',
    desc: 'The AI remembers every character, location, and plotline from your novel — no more continuity errors.',
    color: 'var(--color-purple-600)',
  },
  {
    icon: <Zap size={22} />,
    title: 'Streaming Generation',
    desc: 'Watch your story come alive in real-time with server-side streaming. Generate full chapters instantly.',
    color: 'var(--color-teal-500)',
  },
  {
    icon: <Users size={22} />,
    title: 'Reader Community',
    desc: 'Publish your work and build an audience. Readers can follow, comment, and bookmark your stories.',
    color: 'var(--color-blue-500)',
  },
];

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '5rem 1.5rem 6rem',
          textAlign: 'center',
        }}
      >
        {/* Background decoration */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-10rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60rem',
            height: '40rem',
            background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          {/* Badge */}
          <span
            className="badge badge-blue animate-fade-in"
            style={{ marginBottom: '1.5rem', display: 'inline-flex', fontSize: '0.875rem', padding: '0.375rem 1rem' }}
          >
            <Sparkles size={14} />
            AI-Powered Novel Writing Platform
          </span>

          <h1
            className="animate-fade-in"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: 'var(--color-text-primary)',
              marginBottom: '1.25rem',
            }}
          >
            Write better novels{' '}
            <span className="ai-gradient-text">with AI</span>
          </h1>

          <p
            className="animate-fade-in"
            style={{
              fontSize: '1.1875rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
              marginBottom: '2.5rem',
              maxWidth: '600px',
              margin: '0 auto 2.5rem',
            }}
          >
            PlotWeaver gives every writer an intelligent co-author. Generate chapters, maintain story context, and publish to readers — all in one place.
          </p>

          <div
            className="animate-fade-in"
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {isAuthenticated ? (
              <Link to="/writer" id="hero-dashboard-btn">
                <Button variant="primary" size="xl" rightIcon={<ArrowRight size={18} />}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register" id="hero-start-btn">
                  <Button variant="primary" size="xl" rightIcon={<ArrowRight size={18} />}>
                    Start Writing Free
                  </Button>
                </Link>
                <Link to="/discover" id="hero-discover-btn">
                  <Button variant="secondary" size="xl">
                    Explore Stories
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '4rem 1.5rem', backgroundColor: 'var(--color-bg-subtle)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              textAlign: 'center',
              color: 'var(--color-text-primary)',
              marginBottom: '0.75rem',
            }}
          >
            Everything a writer needs
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              marginBottom: '3rem',
              fontSize: '1.0625rem',
            }}
          >
            Powerful tools designed for serious storytellers
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card card-hover animate-fade-in"
                style={{ padding: '1.75rem' }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: `${f.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: f.color,
                    marginBottom: '1rem',
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
              Ready to write your masterpiece?
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '1.0625rem' }}>
              Join thousands of writers already using PlotWeaver to craft extraordinary stories.
            </p>
            <Link to="/register" id="cta-register-btn">
              <Button variant="primary" size="xl" leftIcon={<Sparkles size={18} />}>
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
