// src/router/index.ts
import { createRouter, createWebHistory } from '@ionic/vue-router';
import Users from '@/views/Users.vue';
import Attendance from '@/views/Attendance.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import { secureStorage } from '@/lib/auth';
import { sessionRole, loadRoleFromToken } from '@/lib/session';

const routes = [
  { path: '/register', component: Register, meta: { requiresAuth: true, adminOnly: true } }, // pubblica
  { path: '/login', component: Login },       // pubblica

  // solo admin
  { path: '/users', component: Users, meta: { requiresAuth: true, adminOnly: true } },
  { path: '/attendance/:userId', component: Attendance, meta: { requiresAuth: true, adminOnly: true } },

  // utente loggato (se stesso)
  { path: '/attendance', component: Attendance, meta: { requiresAuth: true } },

  { path: '/', redirect: '/attendance' },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  // token dal secure storage
  const token = await secureStorage.sget('access_token');

  // se la rotta è pubblica, ma sei già loggato, evita di vedere login/register
  if (!to.meta?.requiresAuth) {
    if (token && (to.path === '/login' || to.path === '/register')) {
      return '/attendance';
    }
    return true;
  }

  // rotta protetta: serve token
  if (!token) return '/login';

  // rotta solo admin
  if (to.meta?.adminOnly) {
    if (!sessionRole.value) await loadRoleFromToken(); // assicura che il ruolo sia in memoria
    if (sessionRole.value !== 'admin') return '/attendance';
  }

  return true;
});

export default router;
