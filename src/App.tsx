import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Gallery } from './pages/Gallery';
import { Contact } from './pages/Contact';
import { AdminLogin } from './pages/AdminLogin';
import { AccessDenied } from './pages/AccessDenied';
import { DeveloperSupport } from './pages/DeveloperSupport';
import { Dashboard } from './admin/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <HashRouter>
            <Routes>
              {/* Public Routes with surrounding sticky navigation and responsive headers */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="testimonials" element={<Navigate to="/about" replace />} />
                <Route path="gallery" element={<Gallery />} />
                <Route path="contact" element={<Contact />} />
                <Route path="admin/login" element={<AdminLogin />} />              <Route path="developer-support" element={<DeveloperSupport />} />                <Route path="access-denied" element={<AccessDenied />} />
              </Route>

              {/* Protected dashboard layer, enforcing email credentials list */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </HashRouter>
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
