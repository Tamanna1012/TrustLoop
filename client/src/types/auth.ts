export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'platformAdmin';
  trustScore: number;
  avatarUrl: string | null;
  createdAt: string;
}
