import axios from 'axios';
import { secureStorage, refreshTokens } from './auth';
import { loading } from './loading';
import { showError } from './notify';

export const API = axios.create({
  // URL dell'API
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000',
});

/**
 * REQUEST INTERCEPTOR
 * - accende il loader (a meno che non metti l'header 'x-no-loading')
 * - aggiunge Authorization Bearer
 */
API.interceptors.request.use(
  async (config) => {
    // accendi loader (se non esplicitamente disattivato)
    if (!(config.headers as any)?.['x-no-loading']) {
      loading.start();
    }

    // token
    const token = await secureStorage.sget('access_token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload?.exp && payload.exp - now < 300) {
        try { await refreshTokens(); } catch { /* se fallisce → si andrà su 401 */ }
      }
    }
    // Usa SEMPRE il token aggiornato dopo il possibile refresh
    const fresh = await secureStorage.sget('access_token');
    if (fresh) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${fresh}`;
    }
    return config;
  },
  (error) => {
    // in caso di errore prima dell'invio della request, spegni loader
    loading.stop();
    return Promise.reject(error);
  },
);

// per il refresh 401
let refreshing = false;
let queue: Array<() => void> = [];

/**
 * RESPONSE INTERCEPTOR
 * - spegne il loader su success
 * - spegne il loader su error
 * - gestisce il refresh token su 401 (prima volta)
 */
API.interceptors.response.use(
  (res) => {
    // spegni loader (se non disattivato per quella request)
    if (!(res.config.headers as any)?.['x-no-loading']) {
      loading.stop();
    }
    return res;
  },
  async (error) => {
    const original: any = error.config;

    // spegni loader della request fallita (se non disattivato)
    if (!(original?.headers as any)?.['x-no-loading']) {
      loading.stop();
    }

    const status = error?.response?.status;
    const url = (original?.url || '') as string;

    // Non provare refresh per queste route
    const isAuthRoute = url.includes('/auth/refresh') || url.includes('/auth/logout');

    // se 401 e non già ritentata
    if (status === 401 && !original?._retry && !isAuthRoute) {
      original._retry = true;
      // Fast-exit: niente refresh se non ho RT
      const rt = await secureStorage.sget('refresh_token');
      if (!rt) {
        await secureStorage.sremove('access_token');
        await secureStorage.sremove('refresh_token');
        // redirect immediato
        window.location.href = '/login';
        return Promise.reject(error);
      }
      if (!refreshing) {
        refreshing = true;
        try {
          await refreshTokens();   // rinnova e ruota i token
          refreshing = false;
          queue.forEach((fn) => fn());        // sblocca chi aspettava
          queue = [];
        } catch (e) {
          refreshing = false;
          queue.forEach((fn) => fn());
          queue = [];
          // refresh fallito -> logout soft
          await secureStorage.sremove('access_token');
          await secureStorage.sremove('refresh_token');
          throw error;
        }
      } else {
        // c'è già un refresh in corso: aspetto che finisca
        await new Promise<void>((resolve) => queue.push(resolve));
      }


      // riprova la request con il token aggiornato
      const fresh = await secureStorage.sget('access_token');
      original.headers = original.headers ?? {};
      (original.headers as any).Authorization = fresh ? `Bearer ${fresh}` : '';

      return API(original);
    }

    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || error.message || 'Errore di rete';

      showError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } else {
      showError('Connessione assente o server irraggiungibile');
    }
    // altri errori
    throw error;

  },
);
