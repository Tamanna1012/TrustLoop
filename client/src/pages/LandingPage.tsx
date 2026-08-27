import { Link } from 'react-router-dom';
import { Users, ScrollText, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

const steps = [
  {
    title: 'Start or join a circle',
    body: 'Set the contribution amount, how often it collects, and how many members — or join one with an invite code.',
  },
  {
    title: 'Contribute each cycle',
    body: 'Every payment is recorded the moment it comes in — no more chasing screenshots in a group chat.',
  },
  {
    title: 'Payouts rotate automatically',
    body: 'Once a cycle is fully collected, the payout fires to that round’s recipient and the next cycle opens.',
  },
];

const values = [
  {
    icon: ScrollText,
    title: 'A real ledger',
    body: 'Every contribution and payout is a permanent record — not a WhatsApp thread nobody can search.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust that’s earned',
    body: 'On-time payments build a member’s trust score; late ones cost more than one payment earns back.',
  },
  {
    icon: Users,
    title: 'Built for the group you already have',
    body: 'Friends, flatmates, coworkers — the circle you’d normally run on trust alone, minus the risk.',
  },
];

export function LandingPage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-6 pb-20 pt-16 text-center sm:pt-24">
        <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          Group savings, minus the
          <br />
          spreadsheet and the suspicion.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-foreground-muted">
          TrustLoop runs your savings circle with a real ledger, automatic payout
          rotation, and a trust score every member can see.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/register">
            <Button size="lg">
              Start a circle <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </Link>
          <Link to="/circles/join">
            <Button size="lg" variant="secondary">
              Join with an invite code
            </Button>
          </Link>
        </div>
      </section>

      <section className="border-y border-border bg-surface py-16">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-center text-sm font-medium uppercase tracking-wide text-foreground-faint">
            How it works
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title}>
                <span className="font-display text-2xl text-primary">{index + 1}</span>
                <h3 className="mt-2 font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-sm text-foreground-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-5 sm:grid-cols-3">
          {values.map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <CardBody className="pt-5">
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-foreground-muted">{body}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-24 text-center">
        <h2 className="text-2xl font-semibold text-foreground">Ready to run your circle properly?</h2>
        <div className="mt-5">
          <Link to="/register">
            <Button size="lg">Create your first circle</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
