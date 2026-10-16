import { apiRequest } from '@/services/api';
import type { AuthSession, User } from '@/types';

export function login(email: string, password: string): Promise<AuthSession> {
  return apiRequest<AuthSession>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function register(name: string, email: string, password: string): Promise<AuthSession> {
  return apiRequest<AuthSession>('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
}

export async function fetchMe(): Promise<User> {
  const result = await apiRequest<{ user: User }>('/api/auth/me');
  return result.user;
}
