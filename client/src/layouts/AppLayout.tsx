import { Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';

// Structural shell only — real nav design lands in Phase 6.
export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-3" style={{ borderColor: 'var(--color-border)' }}>
        <Link to="/dashboard" className="font-semibold" style={{ color: 'var(--color-teal)' }}>
          TrustLoop
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/circles/new">New circle</Link>
          <Link to="/profile">{user?.name}</Link>
          <button type="button" onClick={() => logout.mutate()}>
            Log out
          </button>
        </nav>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
