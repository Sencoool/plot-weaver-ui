import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';

import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Discover from './pages/Discover';
import NovelDetails from './pages/NovelDetails';
import Reader from './pages/Reader';
import WriterDashboard from './pages/WriterDashboard';
import NovelEditor from './pages/NovelEditor';
import EpisodeEditor from './pages/EpisodeEditor';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';

/** Handles the Google OAuth callback — extracts ?token= from URL and logs user in */
function AuthCallback() {
  const [params] = useSearchParams();
  const { login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      // Store token and redirect to home
      // A full implementation would also call GET /auth/me to get user info
      login({ id: '', email: '' }, token);
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [params, login, navigate]);

  return null;
}

function App() {
  // Apply dark class to <html> on initial load based on stored preference
  const { mode } = useThemeStore();
  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  return (
    <Router>
      <Routes>
        {/* Public pages — MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="discover" element={<Discover />} />
          <Route path="novel/:id" element={<NovelDetails />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="admin" element={<AdminDashboard />} />

          {/* Writer workspace */}
          <Route path="writer" element={<WriterDashboard />} />
          <Route path="writer/novel/:id" element={<NovelEditor />} />
        </Route>

        {/* Episode editor — full screen, no sidebar */}
        <Route
          path="/writer/novel/:novelId/episode/:episodeId"
          element={<EpisodeEditor />}
        />

        {/* Reader — distraction-free full screen */}
        <Route path="/read/:novelId/:episodeId" element={<Reader />} />

        {/* Google OAuth callback */}
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </Router>
  );
}

export default App;
