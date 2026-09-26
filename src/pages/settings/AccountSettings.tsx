import { useState } from 'react';
import { KeyRound, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { logoutEverywhere } from '../../services/authService';

/**
 * Account actions. Right now that means one thing: signing out of every device.
 *
 * Plain logout only clears the token in this browser — the JWT stays valid until
 * it expires, so a copy taken from localStorage keeps working. This revokes them
 * all server-side.
 */
export function AccountSettings() {
  const { user, logout } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  const handleLogoutEverywhere = async () => {
    setIsWorking(true);
    try {
      await logoutEverywhere();
      addToast({
        type: 'success',
        title: 'Signed out everywhere',
        message: 'Every device has been signed out, including this one.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Could not reach the server',
        message: 'You are signed out here, but other sessions may still be active.',
      });
    } finally {
      // Local state is cleared either way: keeping a token we believe is revoked
      // would be worse than asking the user to sign in again.
      logout();
      navigate('/login');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div
        className="card"
        style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <KeyRound size={18} style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Account
          </h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Signed in as <strong>{user?.email ?? 'unknown'}</strong>.
        </p>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '0.375rem',
          }}
        >
          Sessions
        </h3>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '1rem',
            maxWidth: '46ch',
          }}
        >
          Signing out only forgets the token in this browser, and it stays valid for up to seven days
          elsewhere. Signing out everywhere revokes every token issued so far — including the one
          this browser is using.
        </p>

        {confirming ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
              Sign out on every device?
            </span>
            <button
              onClick={handleLogoutEverywhere}
              disabled={isWorking}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'var(--color-danger)',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isWorking ? 'wait' : 'pointer',
                opacity: isWorking ? 0.7 : 1,
              }}
            >
              <LogOut size={15} />
              {isWorking ? 'Signing out…' : 'Yes, sign out everywhere'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={isWorking}
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'transparent',
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-danger)',
              backgroundColor: 'transparent',
              color: 'var(--color-danger)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <LogOut size={15} />
            Log out everywhere
          </button>
        )}
      </div>
    </div>
  );
}
