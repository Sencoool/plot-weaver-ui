import { Link, useLocation } from 'react-router-dom';
import { BookOpen, LayoutDashboard, PenLine, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',   to: '/writer',         icon: <LayoutDashboard size={18} />, id: 'sidebar-dashboard' },
  { label: 'My Novels',   to: '/writer',         icon: <BookOpen size={18} />,        id: 'sidebar-novels'    },
  { label: 'New Novel',   to: '/writer/new',     icon: <PenLine size={18} />,         id: 'sidebar-new'       },
  { label: 'Profile',     to: '/profile',        icon: <Settings size={18} />,        id: 'sidebar-profile'   },
];

export function WriterSidebar() {
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (to: string) => location.pathname === to;

  return (
    <aside
      style={{
        width: '220px',
        flexShrink: 0,
        borderRight: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-elevated)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        position: 'sticky',
        top: '64px',
        height: 'calc(100vh - 64px)',
        overflowY: 'auto',
      }}
    >
      {/* User info */}
      <div style={{ padding: '0 1rem 1.25rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.75rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-blue-600), var(--color-purple-600))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
          }}
        >
          {(user?.name ?? user?.email ?? 'W')[0].toUpperCase()}
        </div>
        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.125rem' }}>
          {user?.name ?? user?.email?.split('@')[0] ?? 'Writer'}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email}
        </p>
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', padding: '0 0.5rem' }}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            id={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              color: isActive(item.to) ? 'var(--color-blue-600)' : 'var(--color-text-secondary)',
              backgroundColor: isActive(item.to) ? 'var(--color-surface)' : 'transparent',
              fontWeight: isActive(item.to) ? 600 : 400,
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.to)) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--color-bg-subtle)';
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.to)) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
