import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/HomeView.vue') // Lazy load
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue')
        },
        // Director Routes
        {
            path: '/director',
            name: 'director-dashboard',
            component: () => import('../views/director/Dashboard.vue'),
            meta: { requiresAuth: true, role: 'director' }
        },
        // Master Routes
        {
            path: '/master',
            name: 'master-dashboard',
            component: () => import('../views/master/Dashboard.vue'),
            meta: { requiresAuth: true, role: 'master' }
        },
        // Admin Routes
        {
            path: '/admin',
            name: 'admin-dashboard',
            component: () => import('../views/admin/Dashboard.vue'),
            meta: { requiresAuth: true, role: 'admin' }
        }
    ]
})

// Navigation Guard
import { useAuthStore } from '../stores/auth';

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    // Ensure user state is loaded (basic check)

    if (to.meta.requiresAuth) {
        if (!authStore.isAuthenticated) {
            return next('/login');
        }

        // Strict Role Check
        if (to.meta.role && authStore.user.role !== to.meta.role) {
            // If trying to access unauthorized route, redirect to their own dashboard
            if (authStore.user.role === 'admin') return next('/admin');
            if (authStore.user.role === 'director') return next('/director');
            if (authStore.user.role === 'master') return next('/master');
            return next('/login');
        }
    }
    next();
});

export default router;
