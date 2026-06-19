import { Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AdminDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="page-container" style={{ paddingTop: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Shield size={24} style={{ color: 'var(--color-danger)' }} />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
          Admin Dashboard
        </h1>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Welcome, <strong>{user?.email}</strong>. Admin controls will be implemented here.
        </p>
        <ul style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 2, paddingLeft: '1.25rem' }}>
          <li>User management and role assignment</li>
          <li>Content moderation (reviews, comments)</li>
          <li>Reported content review</li>
          <li>Site-wide statistics</li>
        </ul>
      </div>
    </div>
  );
}
