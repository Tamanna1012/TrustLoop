import { useAuthStore } from '@/store/authStore';
import { Card, CardBody } from '@/components/ui/Card';
import { formatDate } from '@/lib/format';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-semibold text-foreground">{user.name}</h1>
      <p className="text-sm text-foreground-muted">{user.email}</p>

      <Card className="mt-6">
        <CardBody className="pt-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground-muted">Trust score</p>
            <p className="tabular-nums text-2xl font-semibold text-foreground">{user.trustScore}</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-sunken">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${user.trustScore}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-foreground-faint">
            Starts at 100. On-time contributions add a little back; a late one costs more than one
            on-time payment earns — so consistency is what keeps this high.
          </p>
        </CardBody>
      </Card>

      <p className="mt-6 text-xs text-foreground-faint">Member since {formatDate(user.createdAt)}</p>
    </div>
  );
}
