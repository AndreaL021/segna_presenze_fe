import { createRouter, createWebHistory } from '@ionic/vue-router';
import Users from '@/views/Users.vue';
import Attendance from '@/views/Attendance.vue';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import { secureStorage } from '@/lib/auth';

const routes = [
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  { path: '/users', component: Users, meta: { requiresAuth: true } }, 
  { path: '/attendance', component: Attendance, meta: { requiresAuth: true } },
  { path: '/attendance/:userId', component: Attendance, meta: { requiresAuth: true } },
  { path: '/', redirect: '/users' },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true;
  const token = await secureStorage.sget('access_token');
  if (!token) return '/login';
  return true;
});

export default router;
