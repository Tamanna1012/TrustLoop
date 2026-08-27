import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import type { Circle } from '@/types/circle';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { circleStatusTone, circleStatusLabel } from '@/lib/status';
import { formatCurrency } from '@/lib/format';

export function CircleCard({
  circle,
  payoutPosition,
  hasReceivedPayout,
}: {
  circle: Circle;
  payoutPosition?: number;
  hasReceivedPayout?: boolean;
}) {
  return (
    <Link to={`/circles/${circle._id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardBody className="pt-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground">{circle.name}</h3>
            <Badge tone={circleStatusTone[circle.status]}>{circleStatusLabel[circle.status]}</Badge>
          </div>
          <p className="mt-1 tabular-nums text-sm text-foreground-muted">
            {formatCurrency(circle.contributionAmount)} · {circle.cycleFrequency}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-foreground-faint">
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden="true" />
              Up to {circle.maxMembers} members
            </span>
            {payoutPosition !== undefined && (
              <span>{hasReceivedPayout ? 'Payout received' : `Position #${payoutPosition + 1}`}</span>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
