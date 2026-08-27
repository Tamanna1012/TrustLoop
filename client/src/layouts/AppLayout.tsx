import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, UserRound, ShieldCheck, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/circles/new', label: 'New circle', icon: PlusCircle },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
        <div className="mb-8 px-2 font-display text-lg font-semibold text-primary">TrustLoop</div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-sunken hover:text-foreground',
                  isActive && 'bg-primary-soft text-primary-strong hover:bg-primary-soft'
                )
              }
              end={to === '/dashboard'}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}

          {user?.role === 'platformAdmin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-sunken hover:text-foreground',
                  isActive && 'bg-primary-soft text-primary-strong hover:bg-primary-soft'
                )
              }
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              Admin
            </NavLink>
          )}
        </nav>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between px-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
              <Badge tone="primary" className="mt-1">
                Trust {user?.trustScore}
              </Badge>
            </div>
            <button
              type="button"
              onClick={() => logout.mutate()}
              aria-label="Log out"
              className="rounded-md p-2 text-foreground-faint hover:bg-sunken hover:text-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-x-auto px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
