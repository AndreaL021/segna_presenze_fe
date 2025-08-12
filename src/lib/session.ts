import { ref } from 'vue';
import { secureStorage } from './auth';
import { parseJwt } from './jwt';

export type Role = 'user' | 'admin';

export const sessionRole = ref<Role | null>(null);

export async function loadRoleFromToken() {
  const token = await secureStorage.sget('access_token');
  if (!token) {
    sessionRole.value = null;
    return;
  }
  const payload = parseJwt<{ role?: Role }>(token);
  sessionRole.value = (payload?.role ?? null) as Role | null;
}

export async function isAccessTokenValid(): Promise<boolean> {
  const token = await secureStorage.sget('access_token');
  if (!token) return false;
  const payload = parseJwt<{ exp?: number }>(token);
  if (!payload?.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now; // true se non scaduto
}

export async function clearTokens() {
  await secureStorage.sremove('access_token');
  await secureStorage.sremove('refresh_token');
}
