export function parseJwt<T = any>(token: string): T | null {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(decodeURIComponent(atob(payload).replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}
