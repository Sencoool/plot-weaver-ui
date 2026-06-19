import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { User, Mail, BookOpen } from 'lucide-react';

export default function UserProfile() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="page-container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Please <Link to="/login">sign in</Link> to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem', maxWidth: '600px' }}>
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        {/* Avatar */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-blue-600), var(--color-purple-600))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <User size={36} color="#fff" />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
          {user.name ?? user.email?.split('@')[0] ?? 'Writer'}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          <Mail size={14} />
          {user.email}
        </div>

        <Link to="/writer" id="profile-dashboard-link">
          <div
            className="card card-hover"
            style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', cursor: 'pointer' }}
          >
            <BookOpen size={20} style={{ color: 'var(--color-blue-600)' }} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9375rem' }}>Writer Dashboard</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Manage your novels and episodes</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
