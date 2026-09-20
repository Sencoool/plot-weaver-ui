import { useState } from 'react';
import { Cpu, ArrowLeft, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { ModelSettings } from './settings/ModelSettings';

type SettingsTab = 'models' | 'preferences';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('models');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        {/* Breadcrumb & Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              marginBottom: '0.75rem',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Settings
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Manage your AI model keys, endpoints, and workspace preferences.
          </p>
        </div>

        {/* Tab Navigation & Content Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Sidebar Tabs */}
          <aside
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              padding: '0.625rem',
            }}
          >
            <button
              onClick={() => setActiveTab('models')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: activeTab === 'models' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: activeTab === 'models' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === 'models' ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Cpu size={16} />
              AI Models
            </button>

            <button
              disabled
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--color-text-muted)',
                fontSize: '0.875rem',
                cursor: 'not-allowed',
                textAlign: 'left',
                opacity: 0.6,
              }}
              title="Coming soon"
            >
              <Sliders size={16} />
              Preferences (soon)
            </button>
          </aside>

          {/* Tab Content */}
          <section>
            {activeTab === 'models' && <ModelSettings />}
          </section>
        </div>
      </main>
    </div>
  );
}
