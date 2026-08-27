import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import * as circles from '@/lib/circles';

export function useMyCircles() {
  return useQuery({ queryKey: ['circles'], queryFn: circles.listMyCirclesRequest });
}

export function useCircle(id: string) {
  return useQuery({ queryKey: ['circles', id], queryFn: () => circles.getCircleRequest(id), enabled: !!id });
}

export function useMembers(id: string) {
  return useQuery({ queryKey: ['circles', id, 'members'], queryFn: () => circles.listMembersRequest(id), enabled: !!id });
}

export function useCycles(id: string) {
  return useQuery({ queryKey: ['circles', id, 'cycles'], queryFn: () => circles.listCyclesRequest(id), enabled: !!id });
}

export function useTransactions(id: string) {
  return useQuery({
    queryKey: ['circles', id, 'transactions'],
    queryFn: () => circles.listTransactionsRequest(id),
    enabled: !!id,
  });
}

export function useCreateCircle() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: circles.createCircleRequest,
    onSuccess: (circle) => {
      queryClient.invalidateQueries({ queryKey: ['circles'] });
      navigate(`/circles/${circle._id}`);
    },
  });
}

export function useJoinCircle() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: circles.joinCircleRequest,
    onSuccess: (circle) => {
      queryClient.invalidateQueries({ queryKey: ['circles'] });
      navigate(`/circles/${circle._id}`);
    },
  });
}

export function useActivateCircle(circleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => circles.activateCircleRequest(circleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circles', circleId] });
    },
  });
}

export function useRecordContribution(circleId: string, cycleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => circles.recordContributionRequest(circleId, cycleId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circles', circleId, 'cycles'] });
      queryClient.invalidateQueries({ queryKey: ['circles', circleId, 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['circles', circleId, 'members'] });
    },
  });
}
