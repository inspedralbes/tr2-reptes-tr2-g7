import { defineStore } from 'pinia';
import router from '../router';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/auth/';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        error: null
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role === 'admin',
        isDirector: (state) => state.user?.role === 'director',
        isMaster: (state) => state.user?.role === 'master',
    },
    actions: {
        async login(username, password) {
            try {
                const response = await fetch(API_URL + 'login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                if (data.token) {
                    localStorage.setItem('user', JSON.stringify(data));
                    localStorage.setItem('token', data.token);
                    this.user = data;
                    this.token = data.token;

                    // Redirect based on role
                    if (this.user.role === 'admin') router.push('/admin');
                    else if (this.user.role === 'director') router.push('/director');
                    else if (this.user.role === 'master') router.push('/master');
                }
            } catch (error) {
                this.error = error.message;
                console.error(this.error);
                throw error;
            }
        },
        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            router.push('/login');
        },
        async register(userData) {
            try {
                const response = await fetch(API_URL + 'register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify(userData)
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Registration failed');
                }
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },
        async fetchUsers() {
            try {
                const response = await fetch(API_URL + 'users', {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to fetch users');
                }
                return await response.json();
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },
        async deleteUser(id) {
            try {
                const response = await fetch(API_URL + 'users/' + id, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to delete user');
                }
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        }
    }
});
