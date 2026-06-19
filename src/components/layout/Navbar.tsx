import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Moon, Sun, LogOut, User, PenLine, LayoutDashboard } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

interface NavbarProps {
  variant?: 'default' | 'writer';
}

export function Navbar({ variant = 'default' }: NavbarProps) {
  const { mode, toggleTheme } = useThemeStore();
  const { isAuthenticated, logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)' as unknown as number,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        transition: 'background-color var(--transition-normal)',
      }}
      className="dark:[backgroundColor:rgba(13,19,33,0.85)]"
    >
      <div
        className="page-container"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}
          aria-label="PlotWeaver — Go to home"
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-blue-600), var(--color-purple-600))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <BookOpen size={18} color="#fff" />
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: '1.125rem',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Plot<span className="ai-gradient-text">Weaver</span>
          </span>
        </Link>

        {/* Center nav (writer variant shows a different set) */}
        {variant === 'default' && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Link to="/discover" className="btn btn-ghost btn-sm">
              Discover
            </Link>
          </nav>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            id="theme-toggle"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Writer dashboard link */}
              <Link to="/writer" id="nav-writer-dashboard">
                <Button variant="ghost" size="sm" leftIcon={<LayoutDashboard size={15} />}>
                  Dashboard
                </Button>
              </Link>
              {/* Profile */}
              <Link to="/profile" id="nav-profile">
                <Button variant="ghost" size="sm" icon leftIcon={<User size={15} />}>
                  {user?.name ?? user?.email?.split('@')[0] ?? 'Profile'}
                </Button>
              </Link>
              {/* Logout */}
              <Button
                variant="ghost"
                size="sm"
                icon
                leftIcon={<LogOut size={15} />}
                onClick={handleLogout}
                id="nav-logout"
                aria-label="Logout"
              />
            </>
          ) : (
            <>
              <Link to="/login" id="nav-login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register" id="nav-register">
                <Button variant="primary" size="sm" leftIcon={<PenLine size={14} />}>
                  Start Writing
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
