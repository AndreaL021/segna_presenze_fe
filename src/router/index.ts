// src/router/index.ts
import { createRouter, createWebHistory } from '@ionic/vue-router';
import Users from '@/views/Users.vue';
import Attendance from '@/views/Attendance.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
// import { secureStorage } from '@/lib/auth';
import { sessionRole, loadRoleFromToken } from '@/lib/session';
import { isAccessTokenValid, clearTokens } from '@/lib/session';

const routes = [
  { path: '/register', component: Register, meta: { requiresAuth: true, adminOnly: true } }, // pubblica
  { path: '/login', component: Login },       // pubblica

  // solo admin
  { path: '/users', component: Users, meta: { requiresAuth: true, adminOnly: true } },
  { path: '/attendance/:userId', component: Attendance, meta: { requiresAuth: true, adminOnly: true } },

  // utente loggato (se stesso)
  { path: '/attendance', component: Attendance, meta: { requiresAuth: true } },

  { path: '/', redirect: '/login' },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  const hasValidToken = await isAccessTokenValid();

  // Rotte pubbliche
  if (!to.meta?.requiresAuth) {
    // se hai un token valido e provi a vedere login/register → mandalo su /attendance
    if (hasValidToken && (to.path === '/login' || to.path === '/register')) {
      return '/attendance';
    }
    return true;
  }

  // Rotte protette
  if (!hasValidToken) {
    // token assente o scaduto → pulisci e manda a /login
    await clearTokens();
    return '/login';
  }

  // Rotte solo admin
  if (to.meta?.adminOnly) {
    if (!sessionRole.value) await loadRoleFromToken();
    if (sessionRole.value !== 'admin') return '/attendance';
  }

  return true;
});

export default router;
