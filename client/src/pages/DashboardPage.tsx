import { Link } from 'react-router-dom';
import { PlusCircle, Users2, Gauge, CircleCheck } from 'lucide-react';
import { useMyCircles } from '@/hooks/useCircles';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { CircleCard } from '@/components/CircleCard';

function StatCard({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string | number }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3 pt-5">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary-soft text-primary-strong">
          <Icon className="size-4.5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs text-foreground-faint">{label}</p>
          <p className="tabular-nums text-lg font-semibold text-foreground">{value}</p>
        </div>
      </CardBody>
    </Card>
  );
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: circles, isLoading } = useMyCircles();

  const activeCount = circles?.filter((c) => c.circle.status === 'active').length ?? 0;
  const completedCount = circles?.filter((c) => c.circle.status === 'completed').length ?? 0;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-foreground-muted">Here's where your circles stand.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/circles/join">
            <Button variant="secondary">Join with code</Button>
          </Link>
          <Link to="/circles/new">
            <Button>
              <PlusCircle className="size-4" aria-hidden="true" /> New circle
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users2} label="Active circles" value={activeCount} />
        <StatCard icon={CircleCheck} label="Completed circles" value={completedCount} />
        <StatCard icon={Gauge} label="Trust score" value={user?.trustScore ?? '—'} />
      </div>

      <h2 className="mb-3 mt-8 text-sm font-medium uppercase tracking-wide text-foreground-faint">My circles</h2>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {!isLoading && circles?.length === 0 && (
        <EmptyState
          icon={Users2}
          title="No circles yet"
          description="Start one with friends, or join an existing circle with an invite code."
          action={
            <Link to="/circles/new">
              <Button size="sm">Create your first circle</Button>
            </Link>
          }
        />
      )}

      {!isLoading && circles && circles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {circles.map(({ circle, payoutPosition, hasReceivedPayout }) => (
            <CircleCard
              key={circle._id}
              circle={circle}
              payoutPosition={payoutPosition}
              hasReceivedPayout={hasReceivedPayout}
            />
          ))}
        </div>
      )}
    </div>
  );
}
