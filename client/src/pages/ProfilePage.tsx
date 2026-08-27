import { useAuthStore } from '@/store/authStore';

// Placeholder — real profile & trust-score breakdown lands in Phase 6.
export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div>
      <h1 className="text-xl font-semibold">{user?.name}</h1>
      <p>Trust score: {user?.trustScore}</p>
    </div>
  );
}
