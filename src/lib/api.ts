import axios from 'axios';
import { secureStorage, refreshTokens } from './auth';
import { loading } from './loading';

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
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
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

    // se 401 e non già ritentata
    if (error?.response?.status === 401 && !original?._retry) {
      original._retry = true;

      if (!refreshing) {
        refreshing = true;
        try {
          await refreshTokens();              // rinnova token
          queue.forEach((fn) => fn());        // sblocca chi aspettava
          queue = [];
        } catch {
          // refresh fallito → logout "soft"
          await secureStorage.sremove('access_token');
          await secureStorage.sremove('refresh_token');
          refreshing = false;
          throw error;
        }
        refreshing = false;
      }

      // metti in coda finché il refresh non termina
      await new Promise<void>((resolve) => queue.push(resolve));

      // riprova la request con il nuovo token
      const token = await secureStorage.sget('access_token');
      original.headers = original.headers ?? {};
      (original.headers as any).Authorization = token ? `Bearer ${token}` : '';

      // la nuova request riaccenderà il loader nel request interceptor
      return API(original);
    }

    // altri errori
    throw error;
  },
);
