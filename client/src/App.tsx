import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HealthResponse {
  status: string;
  data: {
    message: string;
    timestamp: string;
  };
}

function App() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.get<HealthResponse>('/health');
      return res.data.data;
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-3xl font-semibold" style={{ color: 'var(--color-teal)' }}>
        TrustLoop
      </h1>
      <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
        {isLoading && 'Checking API connection…'}
        {isError && 'API unreachable — is the server running on :5000?'}
        {data && `${data.message} · ${new Date(data.timestamp).toLocaleTimeString()}`}
      </p>
    </main>
  );
}

export default App;
