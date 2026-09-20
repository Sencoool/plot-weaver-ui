import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Zap, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState, useRef } from 'react';

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

const STORY_SNIPPETS = [
  'แสงจันทร์ส่องลงมาบนพื้นหิน ทำให้เงาของเธอยาวออกไปอย่างลึกลับ ลมกรดพัดผ่านใบไม้แห้ง — บางสิ่งกำลังตามเธออยู่...',
  'ดาบของเขาสะท้อนแสงไฟที่กำลังลุกโชน "คุณเลือกผิดคน" เขาพึมพำ เสียงสั่นเครือด้วยความเจ็บปวดที่ซ่อนอยู่ภายใน',
  'ห้องสมุดโบราณกลิ่นหนังสือเก่าและสายฝนผสมกัน เธอพลิกหน้าสุดท้ายของต้นฉบับ — และตระหนักว่าตัวละครคือเธอเอง',
  'เมืองลอยฟ้าชื่อ Aerith ส่องแสงสีทองยามพระอาทิตย์ตก ห้าปีที่เขาฝันถึงที่นี่ และตอนนี้เขามาถึงแล้ว แต่ทุกอย่างผิดไป',
];

function TypewriterDemo() {
  const [snippetIndex, setSnippetIndex] = useState(0);
  // Typing state carries the snippet it belongs to, so switching snippets
  // resets what is rendered without writing state from inside the effect.
  const [typed, setTyped] = useState({ index: -1, text: '', done: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const snippet = STORY_SNIPPETS[snippetIndex];
  const isCurrent = typed.index === snippetIndex;
  const displayed = isCurrent ? typed.text : '';
  const isDone = isCurrent ? typed.done : false;

  useEffect(() => {
    let i = 0;

    function type() {
      if (i < snippet.length) {
        i++;
        setTyped({ index: snippetIndex, text: snippet.slice(0, i), done: false });
        timerRef.current = setTimeout(type, 28);
      } else {
        setTyped({ index: snippetIndex, text: snippet, done: true });
        // Pause then switch to next snippet
        timerRef.current = setTimeout(() => {
          setSnippetIndex((prev) => (prev + 1) % STORY_SNIPPETS.length);
        }, 3500);
      }
    }

    timerRef.current = setTimeout(type, 400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [snippetIndex, snippet]);

  return (
    <div
      aria-label="AI Writing Demo"
      style={{
        maxWidth: '560px',
        margin: '2.5rem auto 0',
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
      }}
    >
      {/* Fake window chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.625rem 1rem',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-subtle)',
      }}>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: c }} />
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
          <Sparkles size={11} style={{ color: 'var(--color-violet-500)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            AI กำลังเขียน…
          </span>
        </div>
      </div>

      {/* Content area */}
      <div style={{ padding: '1.25rem 1.5rem', minHeight: '100px' }}>
        <p style={{
          fontSize: '0.9375rem', lineHeight: 1.8,
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-serif, Georgia, serif)',
        }}>
          {displayed}
          {!isDone && (
            <span style={{
              display: 'inline-block', width: '2px', height: '1.1em',
              backgroundColor: 'var(--color-violet-500)',
              marginLeft: '1px', verticalAlign: 'text-bottom',
              animation: 'blink 1s step-end infinite',
            }} />
          )}
        </p>
      </div>

      {/* Footer hint */}
      <div style={{
        padding: '0.5rem 1.5rem 0.75rem',
        display: 'flex', alignItems: 'center', gap: '0.375rem',
      }}>
        <div style={{
          height: '3px', flex: 1,
          background: 'var(--color-bg-subtle)',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: isDone ? '100%' : ((displayed.length / STORY_SNIPPETS[snippetIndex].length) * 100).toFixed(1) + '%',
            background: 'linear-gradient(90deg, var(--color-violet-500), var(--color-blue-500))',
            borderRadius: '9999px',
            transition: 'width 0.05s linear',
          }} />
        </div>
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
          {snippetIndex + 1}/{STORY_SNIPPETS.length}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative', overflow: 'hidden',
          padding: '5rem 1.5rem 4rem', textAlign: 'center',
        }}
      >
        {/* Background decoration */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: '-10rem', left: '50%',
            transform: 'translateX(-50%)',
            width: '60rem', height: '40rem',
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
              fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800,
              lineHeight: 1.1, letterSpacing: '-0.03em',
              color: 'var(--color-text-primary)', marginBottom: '1.25rem',
            }}
          >
            Write better novels{' '}
            <span className="ai-gradient-text">with AI</span>
          </h1>

          <p
            className="animate-fade-in"
            style={{
              fontSize: '1.1875rem', color: 'var(--color-text-secondary)',
              lineHeight: 1.7, marginBottom: '2.5rem',
              maxWidth: '600px', margin: '0 auto 2.5rem',
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

          {/* Typewriter Demo */}
          <TypewriterDemo />
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '4rem 1.5rem', backgroundColor: 'var(--color-bg-subtle)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '2rem', fontWeight: 800, textAlign: 'center',
              color: 'var(--color-text-primary)', marginBottom: '0.75rem',
            }}
          >
            Everything a writer needs
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: '3rem', fontSize: '1.0625rem' }}>
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
              <div key={f.title} className="card card-hover animate-fade-in" style={{ padding: '1.75rem' }}>
                <div
                  style={{
                    width: '48px', height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: f.color + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: f.color, marginBottom: '1rem',
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
