import { Link } from 'react-router-dom';

// Placeholder — the real landing page design lands in Phase 6.
export function LandingPage() {
  return (
    <div className="mx-auto max-w-2xl py-24 text-center">
      <h1 className="text-3xl font-semibold" style={{ color: 'var(--color-teal)' }}>
        TrustLoop
      </h1>
      <p className="mt-2" style={{ color: 'var(--color-ink-muted)' }}>
        Group savings, minus the spreadsheet and the suspicion.
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <Link to="/login">Log in</Link>
        <Link to="/register">Get started</Link>
      </div>
    </div>
  );
}
