import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { Copy, Check, CircleDollarSign, MessageSquareWarning } from 'lucide-react';
import {
  useCircle,
  useMembers,
  useCycles,
  useTransactions,
  useActivateCircle,
  useRecordContribution,
} from '@/hooks/useCircles';
import { useDisputes, useCreateDispute, useResolveDispute } from '@/hooks/useDisputes';
import { usePayContribution } from '@/hooks/usePayment';
import { getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { circleStatusTone, circleStatusLabel, cycleStatusTone, cycleStatusLabel } from '@/lib/status';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Dispute } from '@/types/dispute';

const TABS = ['overview', 'members', 'ledger', 'disputes'] as const;
type Tab = (typeof TABS)[number];

const disputeStatusTone = {
  open: 'accent',
  underReview: 'accent',
  resolved: 'success',
  rejected: 'destructive',
} as const;

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
  const isPlatformAdmin = user?.role === 'platformAdmin';

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
              currentUserId={user?.id}
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

        {tab === 'disputes' && (
          <DisputesTab circleId={circleId} canResolve={isAdmin || isPlatformAdmin} />
        )}
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
  currentUserId,
  collectingCycleId,
  contributedUserIds,
}: {
  circleId: string;
  members: import('@/types/circle').Member[];
  isAdmin: boolean;
  currentUserId?: string;
  collectingCycleId?: string;
  contributedUserIds: Set<string>;
}) {
  const recordContribution = useRecordContribution(circleId, collectingCycleId ?? '');
  const payContribution = usePayContribution(circleId, collectingCycleId ?? '');
  const [payError, setPayError] = useState<string | null>(null);

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
            {collectingCycleId && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const hasContributed = contributedUserIds.has(member.userId._id);
            const isSelf = member.userId._id === currentUserId;
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
                {collectingCycleId && (
                  <td className="px-4 py-3 text-right">
                    {!hasContributed && (
                      <div className="flex justify-end gap-2">
                        {isSelf && (
                          <Button
                            size="sm"
                            loading={payContribution.isPending}
                            onClick={() => {
                              setPayError(null);
                              payContribution.mutate(undefined, {
                                onError: (err) =>
                                  setPayError(getApiErrorMessage(err, 'Payment failed')),
                              });
                            }}
                          >
                            Pay online
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={recordContribution.isPending}
                            onClick={() => recordContribution.mutate(member.userId._id)}
                          >
                            Mark paid
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {payError && <p className="mt-3 text-sm text-destructive">{payError}</p>}
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

function DisputesTab({ circleId, canResolve }: { circleId: string; canResolve: boolean }) {
  const { data: disputes, isLoading } = useDisputes(circleId);
  const createDispute = useCreateDispute(circleId);
  const resolveDispute = useResolveDispute(circleId);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ description: string }>();

  if (isLoading) return <Skeleton className="h-48" />;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" variant="secondary" onClick={() => setModalOpen(true)}>
          Raise a dispute
        </Button>
      </div>

      {(!disputes || disputes.length === 0) ? (
        <EmptyState icon={MessageSquareWarning} title="No disputes" description="Hopefully it stays that way." />
      ) : (
        <ul className="flex flex-col gap-3">
          {disputes.map((dispute: Dispute) => (
            <li key={dispute._id}>
              <Card>
                <CardBody className="pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-foreground">{dispute.description}</p>
                      <p className="mt-1.5 text-xs text-foreground-faint">
                        Raised by {typeof dispute.raisedBy === 'string' ? dispute.raisedBy : dispute.raisedBy.name} ·{' '}
                        {formatDateTime(dispute.createdAt)}
                      </p>
                    </div>
                    <Badge tone={disputeStatusTone[dispute.status]}>{dispute.status}</Badge>
                  </div>
                  {canResolve && (dispute.status === 'open' || dispute.status === 'underReview') && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={resolveDispute.isPending}
                        onClick={() => resolveDispute.mutate({ disputeId: dispute._id, status: 'resolved' })}
                      >
                        Mark resolved
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={resolveDispute.isPending}
                        onClick={() => resolveDispute.mutate({ disputeId: dispute._id, status: 'rejected' })}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Raise a dispute">
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit(({ description }) => {
            createDispute.mutate(description, {
              onSuccess: () => {
                reset();
                setModalOpen(false);
              },
            });
          })}
        >
          <textarea
            rows={4}
            placeholder="What happened? Be specific — this goes to the circle admin."
            className="w-full rounded-md border border-border bg-surface p-3 text-sm text-foreground placeholder:text-foreground-faint"
            {...register('description', { required: true, minLength: 10 })}
          />
          <Button type="submit" loading={createDispute.isPending}>
            Submit
          </Button>
        </form>
      </Modal>
    </div>
  );
}
