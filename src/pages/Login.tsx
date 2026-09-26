import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import api from '../services/api';
import type { AuthResponse } from '../types/user';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useUiStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      // Fetch user profile
      const meRes = await api.get<{ id: string; email: string; name?: string }>('/auth/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      login(meRes.data, data.access_token);
      addToast({ type: 'success', title: 'Welcome back!', message: `Signed in as ${meRes.data.email}` });
      navigate('/writer');
    } catch {
      addToast({ type: 'error', title: 'Sign in failed', message: 'Invalid email or password.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--color-blue-600), var(--color-purple-600))',
              boxShadow: 'var(--shadow-glow-lg)',
              marginBottom: '1rem',
            }}
          >
            <BookOpen size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
            Sign in to Narrax
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
            Continue your story where you left off
          </p>
        </div>

        {/* Card */}
        <div
          className="card"
          style={{ padding: '2rem' }}
        >
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Email address"
              type="email"
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              leftIcon={<Mail size={16} />}
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              leftIcon={<Lock size={16} />}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              id="login-submit"
              style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0' }}>
            <hr className="divider" style={{ flex: 1 }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>or</span>
            <hr className="divider" style={{ flex: 1 }} />
          </div>

          {/* Google OAuth */}
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/google`}
            id="login-google"
          >
            <Button
              variant="secondary"
              style={{ width: '100%', justifyContent: 'center', gap: '0.625rem' }}
              leftIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              }
            >
              Continue with Google
            </Button>
          </a>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" id="login-register-link" style={{ color: 'var(--color-blue-600)', fontWeight: 600 }}>
            Start writing for free
          </Link>
        </p>
      </div>
    </div>
  );
}
