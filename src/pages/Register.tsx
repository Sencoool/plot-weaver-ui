import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, PenLine } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import api from '../services/api';
import type { AuthResponse } from '../types/user';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useUiStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', { email, password });
      const meRes = await api.get<{ id: string; email: string; name?: string }>('/auth/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      login(meRes.data, data.access_token);
      addToast({ type: 'success', title: 'Account created!', message: 'Welcome to Narrax.' });
      navigate('/writer');
    } catch {
      addToast({ type: 'error', title: 'Registration failed', message: 'Email may already be in use.' });
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
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '56px', height: '56px', borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--color-blue-600), var(--color-purple-600))',
              boxShadow: 'var(--shadow-glow-lg)', marginBottom: '1rem',
            }}
          >
            <PenLine size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
            Start your story
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
            Create your free Narrax account
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Display name"
              type="text"
              id="register-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your pen name"
              error={errors.name}
              leftIcon={<User size={16} />}
              autoFocus
            />
            <Input
              label="Email address"
              type="email"
              id="register-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              leftIcon={<Mail size={16} />}
            />
            <Input
              label="Password"
              type="password"
              id="register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              error={errors.password}
              leftIcon={<Lock size={16} />}
              hint="At least 8 characters"
            />
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              id="register-submit"
              style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}
            >
              Create Account
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" id="register-login-link" style={{ color: 'var(--color-blue-600)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
