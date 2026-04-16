import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { cognitoService, userPool } from './services/cognito';
import { LOCAL_STORAGE_KEYS, resolveRole, USER_ROLES, DEFAULT_ADMIN_ROUTE } from './constants';

// Pagine pubbliche
import Home from './Pages/Home/Home';
import EventiPage from './Pages/Eventi/Eventi';

import GalleryPage from './Pages/Gallery/Gallery';
import GalleryAlbumPage from './Pages/Gallery/GalleryAlbum';
import DiscografiaPage from './Pages/Discografia/Discografia';

// Auth
import Login from './Pages/Auth/Login';

// Admin
import Events from './Pages/Backoffice/Events/Events';
import EventDetail from './Pages/Backoffice/Events/EventDetail';
import PressList from './Pages/Backoffice/Press/Press';
import PressDetail from './Pages/Backoffice/Press/PressDetail';
import PhotoAlbums from './Pages/Backoffice/PhotoAlbums/PhotoAlbums';
import PhotoAlbumDetail from './Pages/Backoffice/PhotoAlbums/PhotoAlbumDetail';
import MusicAlbums from './Pages/Backoffice/MusicAlbums/MusicAlbums';
import MusicAlbumDetail from './Pages/Backoffice/MusicAlbums/MusicAlbumDetail';
import AdminLayout from './Components/AdminLayout';

// ---------------------------------------------------------------------------
// ProtectedRoute
// ---------------------------------------------------------------------------
interface ProtectedRouteProps {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  onLogout?: () => void;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated, isCheckingAuth, onLogout, children
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.RETURN_URL, window.location.pathname);
      navigate('/admin/login');
    }
  }, [isAuthenticated, isCheckingAuth, navigate]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <AdminLayout onLogout={onLogout}>{children}</AdminLayout>;
};

// ---------------------------------------------------------------------------
// AppContent
// ---------------------------------------------------------------------------
const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle('admin-mode', location.pathname.startsWith('/admin'));
  }, [location.pathname]);

  useEffect(() => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) { setIsCheckingAuth(false); return; }

    const timeout = setTimeout(() => setIsCheckingAuth(false), 3000);

    cognitoUser.getSession((err: any, session: any) => {
      clearTimeout(timeout);
      if (err || !session?.isValid()) { setIsCheckingAuth(false); return; }

      const idToken = session.getIdToken().getJwtToken();
      const payload = cognitoService.getTokenPayload(idToken);
      const groups: string[] = payload?.['cognito:groups'] ?? [];
      const role = resolveRole(groups);

      if (role) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.ID_TOKEN, idToken);
        localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, session.getAccessToken().getJwtToken());
        localStorage.setItem(LOCAL_STORAGE_KEYS.JWT_TOKEN, idToken);
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER_ROLE, role);
        setIsAuthenticated(true);
        setUserRole(role);
      }
      setIsCheckingAuth(false);
    });
  }, []);

  const handleLogout = () => {
    cognitoService.signOut();
    setIsAuthenticated(false);
    setUserRole('');
  };

  const protectedProps = { isAuthenticated, isCheckingAuth, onLogout: handleLogout };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Pubbliche */}
        <Route path="/" element={<Home />} />
        <Route path="/eventi" element={<EventiPage />} />

        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/:albumId" element={<GalleryAlbumPage />} />
        <Route path="/discografia" element={<DiscografiaPage />} />

        {/* Login */}
        <Route
          path="/admin/login"
          element={
            isAuthenticated && userRole === USER_ROLES.ADMIN
              ? <Navigate to={DEFAULT_ADMIN_ROUTE} replace />
              : <Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
          }
        />

        {/* Admin protetto */}
        <Route path="/admin" element={<Navigate to={DEFAULT_ADMIN_ROUTE} replace />} />

        <Route path="/admin/eventi" element={<ProtectedRoute {...protectedProps}><Events /></ProtectedRoute>} />
        <Route path="/admin/eventi/:id" element={<ProtectedRoute {...protectedProps}><EventDetail /></ProtectedRoute>} />

        <Route path="/admin/press" element={<ProtectedRoute {...protectedProps}><PressList /></ProtectedRoute>} />
        <Route path="/admin/press/:id" element={<ProtectedRoute {...protectedProps}><PressDetail /></ProtectedRoute>} />

        <Route path="/admin/gallery" element={<ProtectedRoute {...protectedProps}><PhotoAlbums /></ProtectedRoute>} />
        <Route path="/admin/gallery/:albumId" element={<ProtectedRoute {...protectedProps}><PhotoAlbumDetail /></ProtectedRoute>} />

        <Route path="/admin/discografia" element={<ProtectedRoute {...protectedProps}><MusicAlbums /></ProtectedRoute>} />
        <Route path="/admin/discografia/:id" element={<ProtectedRoute {...protectedProps}><MusicAlbumDetail /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
