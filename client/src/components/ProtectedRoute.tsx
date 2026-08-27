import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);

  if (!isBootstrapped) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function PlatformAdminRoute() {
  const user = useAuthStore((s) => s.user);
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);

  if (!isBootstrapped) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'platformAdmin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
