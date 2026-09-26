import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { ToastContainer } from '../components/ui/Toast';

export default function MainLayout() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <Navbar variant="default" />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer
        style={{
          padding: '1.5rem',
          textAlign: 'center',
          borderTop: '1px solid var(--color-border)',
          fontSize: '0.8125rem',
          color: 'var(--color-text-muted)',
        }}
      >
        © {new Date().getFullYear()} Narrax. Built for storytellers.
      </footer>

      <ToastContainer />
    </div>
  );
}
