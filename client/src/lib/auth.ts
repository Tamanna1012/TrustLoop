import { api } from './api';
import type { AuthUser } from '@/types/auth';

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export async function registerRequest(input: { name: string; email: string; password: string }) {
  const res = await api.post<{ data: AuthResponse }>('/auth/register', input);
  return res.data.data;
}

export async function loginRequest(input: { email: string; password: string }) {
  const res = await api.post<{ data: AuthResponse }>('/auth/login', input);
  return res.data.data;
}

export async function logoutRequest() {
  await api.post('/auth/logout');
}

export async function meRequest() {
  const res = await api.get<{ data: { user: AuthUser } }>('/auth/me');
  return res.data.data.user;
}

export async function refreshRequest() {
  const res = await api.post<{ data: { accessToken: string } }>('/auth/refresh');
  return res.data.data.accessToken;
}
