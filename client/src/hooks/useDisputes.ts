import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as disputes from '@/lib/disputes';
import type { DisputeStatus } from '@/types/dispute';

export function useDisputes(circleId: string) {
  return useQuery({
    queryKey: ['circles', circleId, 'disputes'],
    queryFn: () => disputes.listDisputesRequest(circleId),
    enabled: !!circleId,
  });
}

export function useCreateDispute(circleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (description: string) => disputes.createDisputeRequest(circleId, description),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['circles', circleId, 'disputes'] }),
  });
}

export function useResolveDispute(circleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ disputeId, status }: { disputeId: string; status: Extract<DisputeStatus, 'resolved' | 'rejected'> }) =>
      disputes.resolveDisputeRequest(circleId, disputeId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['circles', circleId, 'disputes'] }),
  });
}
