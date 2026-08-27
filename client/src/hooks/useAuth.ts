import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { loginRequest, registerRequest, logoutRequest } from '@/lib/auth';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: ({ user, accessToken }) => {
      setAuth(user, accessToken);
      navigate('/dashboard');
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerRequest,
    onSuccess: ({ user, accessToken }) => {
      setAuth(user, accessToken);
      navigate('/dashboard');
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      navigate('/login');
    },
  });
}
