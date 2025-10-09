import { API } from './api';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { Preferences } from '@capacitor/preferences';
import { loadRoleFromToken } from './session'

// helpers: secure storage con fallback a Preferences (browser)
async function sset(key: string, value: string) {
  try { await SecureStoragePlugin.set({ key, value }); }
  catch { await Preferences.set({ key, value }); }
}
async function sget(key: string): Promise<string | null> {
  try { return (await SecureStoragePlugin.get({ key })).value ?? null; }
  catch { return (await Preferences.get({ key })).value ?? null; }
}
async function sremove(key: string) {
  try { await SecureStoragePlugin.remove({ key }); }
  catch { await Preferences.remove({ key }); }
}

export async function register(name: string, email: string, password: string) {
  const { data } = await API.post('/user', { name, email, password });
  return data;
}

export async function login(email: string, password: string, remember: boolean) {
  const { data } = await API.post('/auth/login', { email, password });
  await sset('access_token', data.access_token);
  if (remember && data.refresh_token) {
    await sset('refresh_token', data.refresh_token);
  } else {
    await sremove('refresh_token');
  }

  await loadRoleFromToken();
  return data;
}

export async function logout() {
  try { await API.post('/auth/logout'); } catch { }
  await sremove('access_token');
  await sremove('refresh_token');
  await loadRoleFromToken();
}

export async function refreshTokens() {
  const rt = await sget('refresh_token');
  if (!rt) throw new Error('No refresh token');
  const { data } = await API.post('/auth/refresh', { refreshToken: rt }, { timeout: 10000 });
  await sset('access_token', data.access_token);
  await sset('refresh_token', data.refresh_token); // rotazione
  await loadRoleFromToken();
  return data;
}

export async function isLoggedIn() {
  return !!(await sget('access_token'));
}

// esporto i helper per altri file (router/api)
export const secureStorage = { sset, sget, sremove };
