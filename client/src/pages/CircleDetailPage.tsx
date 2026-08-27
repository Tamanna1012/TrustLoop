import { useParams } from 'react-router-dom';

// Placeholder — tabs (Overview/Members/Ledger/Disputes) land in Phase 6.
export function CircleDetailPage() {
  const { id } = useParams();
  return <h1 className="text-xl font-semibold">Circle {id}</h1>;
}
