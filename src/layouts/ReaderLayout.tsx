import { Outlet } from 'react-router-dom';
import { ToastContainer } from '../components/ui/Toast';

/**
 * ReaderLayout — distraction-free full-screen reading experience.
 * No navbar; the Reader page provides its own minimal toolbar.
 */
export default function ReaderLayout() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      <Outlet />
      <ToastContainer />
    </div>
  );
}
