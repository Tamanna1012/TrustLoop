import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Check, CircleDollarSign } from 'lucide-react';
import {
  useCircle,
  useMembers,
  useCycles,
  useTransactions,
  useActivateCircle,
  useRecordContribution,
} from '@/hooks/useCircles';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { circleStatusTone, circleStatusLabel, cycleStatusTone, cycleStatusLabel } from '@/lib/status';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/cn';

const TABS = ['overview', 'members', 'ledger'] as const;
type Tab = (typeof TABS)[number];

export function CircleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const circleId = id!;
  const [tab, setTab] = useState<Tab>('overview');
  const [copied, setCopied] = useState(false);

  const user = useAuthStore((s) => s.user);
  const { data: circle, isLoading: circleLoading } = useCircle(circleId);
  const { data: members, isLoading: membersLoading } = useMembers(circleId);
  const { data: cycles, isLoading: cyclesLoading } = useCycles(circleId);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(circleId);
  const activateCircle = useActivateCircle(circleId);

  const isAdmin = circle?.createdBy === user?.id;

  const collectingCycle = useMemo(() => cycles?.find((c) => c.status === 'collecting'), [cycles]);

  if (circleLoading || !circle) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-foreground">{circle.name}</h1>
            <Badge tone={circleStatusTone[circle.status]}>{circleStatusLabel[circle.status]}</Badge>
          </div>
          <p className="mt-1 tabular-nums text-sm text-foreground-muted">
            {formatCurrency(circle.contributionAmount)} · every {circle.cycleFrequency === 'weekly' ? 'week' : 'month'} ·
            up to {circle.maxMembers} members
          </p>
        </div>

        {circle.status === 'forming' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(circle.inviteCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground hover:bg-sunken"
            >
              {circle.inviteCode}
              {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5 text-foreground-faint" />}
            </button>
            {isAdmin && (
              <Button
                onClick={() => activateCircle.mutate()}
                loading={activateCircle.isPending}
                disabled={(members?.length ?? 0) < 2}
              >
                Start circle
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'border-b-2 px-3 py-2.5 text-sm font-medium capitalize -mb-px',
              tab === t
                ? 'border-primary text-foreground'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="py-6">
        {tab === 'overview' &&
          (cyclesLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <PayoutTimeline
            cycles={cycles ?? []}
            activeMembers={members?.length ?? circle.maxMembers}
            contributionAmount={circle.contributionAmount}
          />
          ))}

        {tab === 'members' &&
          (membersLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <MembersTab
              circleId={circleId}
              members={members ?? []}
              isAdmin={isAdmin}
              collectingCycleId={collectingCycle?._id}
              contributedUserIds={new Set(
                (transactions ?? [])
                  .filter((t) => t.type === 'contribution' && t.cycleId === collectingCycle?._id)
                  .map((t) => (typeof t.userId === 'string' ? t.userId : t.userId._id))
              )}
            />
          ))}

        {tab === 'ledger' &&
          (transactionsLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <LedgerTab transactions={transactions ?? []} />
          ))}
      </div>
    </div>
  );
}

function PayoutTimeline({
  cycles,
  activeMembers,
  contributionAmount,
}: {
  cycles: import('@/types/circle').Cycle[];
  activeMembers: number;
  contributionAmount: number;
}) {
  const target = contributionAmount * activeMembers;
  if (cycles.length === 0) {
    return (
      <EmptyState
        icon={CircleDollarSign}
        title="This circle hasn't started yet"
        description="Cycles appear here once the admin starts the circle."
      />
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {cycles.map((cycle) => {
        const recipient = typeof cycle.payoutRecipient === 'string' ? null : cycle.payoutRecipient;
        return (
          <li key={cycle._id}>
            <Card>
              <CardBody className="flex items-center justify-between gap-4 pt-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-sunken font-mono text-xs text-foreground-muted">
                    {cycle.cycleNumber}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{recipient?.name ?? 'Member'}</p>
                    <p className="text-xs text-foreground-faint">Due {formatDate(cycle.dueDate)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge tone={cycleStatusTone[cycle.status]}>{cycleStatusLabel[cycle.status]}</Badge>
                  <p className="mt-1 tabular-nums text-xs text-foreground-faint">
                    {formatCurrency(cycle.totalCollected)} collected
                    {cycle.status !== 'pending' && ` of ${formatCurrency(target)}`}
                  </p>
                </div>
              </CardBody>
            </Card>
          </li>
        );
      })}
    </ol>
  );
}

function MembersTab({
  circleId,
  members,
  isAdmin,
  collectingCycleId,
  contributedUserIds,
}: {
  circleId: string;
  members: import('@/types/circle').Member[];
  isAdmin: boolean;
  collectingCycleId?: string;
  contributedUserIds: Set<string>;
}) {
  const recordContribution = useRecordContribution(circleId, collectingCycleId ?? '');

  if (members.length === 0) {
    return <EmptyState icon={CircleDollarSign} title="No members yet" />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground-faint">
            <th className="px-4 py-3 font-medium">Member</th>
            <th className="px-4 py-3 font-medium">Trust</th>
            <th className="px-4 py-3 font-medium">Payout position</th>
            <th className="px-4 py-3 font-medium">Status</th>
            {isAdmin && collectingCycleId && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const hasContributed = contributedUserIds.has(member.userId._id);
            return (
              <tr key={member._id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{member.userId.name}</td>
                <td className="px-4 py-3 tabular-nums text-foreground-muted">{member.userId.trustScore}</td>
                <td className="px-4 py-3 tabular-nums text-foreground-muted">#{member.payoutPosition + 1}</td>
                <td className="px-4 py-3">
                  {member.hasReceivedPayout ? (
                    <Badge tone="success">Paid out</Badge>
                  ) : hasContributed ? (
                    <Badge tone="primary">Contributed</Badge>
                  ) : (
                    <Badge tone="neutral">Pending</Badge>
                  )}
                </td>
                {isAdmin && collectingCycleId && (
                  <td className="px-4 py-3 text-right">
                    {!hasContributed && (
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={recordContribution.isPending}
                        onClick={() => recordContribution.mutate(member.userId._id)}
                      >
                        Mark paid
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LedgerTab({ transactions }: { transactions: import('@/types/circle').LedgerTransaction[] }) {
  if (transactions.length === 0) {
    return <EmptyState icon={CircleDollarSign} title="No transactions yet" description="Contributions and payouts will show up here." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground-faint">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Member</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-foreground-faint">{formatDateTime(tx.createdAt)}</td>
              <td className="px-4 py-3 text-foreground">{typeof tx.userId === 'string' ? tx.userId : tx.userId.name}</td>
              <td className="px-4 py-3">
                <Badge tone={tx.type === 'payout' ? 'accent' : 'primary'}>{tx.type}</Badge>
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                {formatCurrency(tx.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
