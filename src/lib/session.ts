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
