import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import type { Toast } from '../../types/user';

const icons = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

const colors = {
  success: {
    bg: 'var(--color-success-bg)',
    border: 'var(--color-success)',
    text: 'var(--color-success)',
  },
  error: {
    bg: 'var(--color-danger-bg)',
    border: 'var(--color-danger)',
    text: 'var(--color-danger)',
  },
  warning: {
    bg: 'var(--color-warning-bg)',
    border: 'var(--color-warning)',
    text: 'var(--color-warning)',
  },
  info: {
    bg: 'var(--color-info-bg)',
    border: 'var(--color-info)',
    text: 'var(--color-info)',
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useUiStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const c = colors[toast.type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        backgroundColor: 'var(--color-bg-elevated)',
        border: `1px solid ${c.border}`,
        borderLeft: `4px solid ${c.border}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '380px',
        width: '100%',
        transition: 'all var(--transition-normal)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(24px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '2px',
          backgroundColor: c.border,
          animation: `toast-shrink ${toast.duration}ms linear forwards`,
        }}
      />

      <span style={{ color: c.text, flexShrink: 0, marginTop: '1px' }}>
        {icons[toast.type]}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'var(--color-text-primary)',
            marginBottom: toast.message ? '0.2rem' : 0,
          }}
        >
          {toast.title}
        </p>
        {toast.message && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          display: 'flex',
          padding: '2px',
          borderRadius: 'var(--radius-xs)',
          transition: 'color var(--transition-fast)',
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useUiStore();

  return (
    <>
      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
      <div
        aria-label="Notifications"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          zIndex: 'var(--z-toast)' as unknown as number,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={toast} />
          </div>
        ))}
      </div>
    </>
  );
}
