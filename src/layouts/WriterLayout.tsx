import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { ToastContainer } from '../components/ui/Toast';

/**
 * WriterLayout — Navbar + full-width content area + toast notifications.
 * The sidebar is rendered per-page (WriterDashboard, NovelEditor) for flexibility.
 */
export default function WriterLayout() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <Navbar variant="writer" />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
}
