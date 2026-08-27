import { Routes, Route } from 'react-router-dom';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import { ProtectedRoute, PlatformAdminRoute } from '@/components/ProtectedRoute';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CircleDetailPage } from '@/pages/CircleDetailPage';
import { CreateCirclePage } from '@/pages/CreateCirclePage';
import { JoinCirclePage } from '@/pages/JoinCirclePage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminPage } from '@/pages/AdminPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function App() {
  useAuthBootstrap();

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/circles/new" element={<CreateCirclePage />} />
          <Route path="/circles/join" element={<JoinCirclePage />} />
          <Route path="/circles/:id" element={<CircleDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<PlatformAdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
