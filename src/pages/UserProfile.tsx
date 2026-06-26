import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNovelStore } from '../store/novelStore';
import { useUiStore } from '../store/uiStore';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, BookOpen, LayoutDashboard, LogOut, Edit3, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import api from '../services/api';

export default function UserProfile() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const { novels, fetchNovels, isLoading } = useNovelStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setEditName(user.name ?? '');
      fetchNovels({ authorId: user.id });
    }
  }, [user?.id, user?.name, fetchNovels]);

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setIsSaving(true);
    try {
      const { data } = await api.patch<{ id: string; email: string; name?: string }>('/auth/me', { name: editName.trim() });
      setUser(data);
      addToast({ type: 'success', title: 'Profile updated!' });
      setIsEditing(false);
    } catch {
      addToast({ type: 'error', title: 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="page-container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Please <Link to="/login" style={{ color: 'var(--color-blue-600)', fontWeight: 600 }}>sign in</Link> to view your profile.
        </p>
      </div>
    );
  }

  const publishedCount = novels.filter((n) => n.status === 'published').length;
  const episodeCount = novels.reduce((sum, n) => sum + (n._count?.episodes ?? 0), 0);

  return (
    <div className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem', maxWidth: '680px' }}>
      {/* Profile Card */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.75rem' }}>
          {/* Avatar */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-blue-600), var(--color-purple-600))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              flexShrink: 0,
            }}
          >
            <User size={32} color="#fff" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                  id="profile-name-input"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                />
                <Button variant="primary" size="sm" loading={isSaving} onClick={handleSaveName} id="profile-save-btn">
                  <CheckCircle size={15} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditName(user.name ?? ''); }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {user.name ?? user.email?.split('@')[0] ?? 'Writer'}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  id="profile-edit-name-btn"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '2px' }}
                  aria-label="Edit display name"
                >
                  <Edit3 size={14} />
                </button>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              <Mail size={13} />
              {user.email}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            marginBottom: '1.5rem',
          }}
        >
          {[
            { label: 'Novels', value: novels.length },
            { label: 'Published', value: publishedCount },
            { label: 'Episodes', value: episodeCount },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-blue-600)', lineHeight: 1 }}>
                {isLoading ? '—' : stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/writer" id="profile-dashboard-link" style={{ flex: 1 }}>
            <Button variant="primary" leftIcon={<LayoutDashboard size={15} />} style={{ width: '100%', justifyContent: 'center' }}>
              Writer Dashboard
            </Button>
          </Link>
          <Button
            variant="ghost"
            leftIcon={<LogOut size={15} />}
            onClick={handleLogout}
            id="profile-logout-btn"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Recent Novels */}
      {novels.length > 0 && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BookOpen size={16} style={{ color: 'var(--color-blue-600)' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              My Novels
            </h2>
          </div>
          {isLoading ? (
            <Spinner size={24} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {novels.slice(0, 5).map((novel) => (
                <Link
                  key={novel.id}
                  to={`/writer/novel/${novel.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="card card-hover"
                    style={{ padding: '0.875rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                      {novel.title}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {novel._count?.episodes ?? 0} episodes
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
