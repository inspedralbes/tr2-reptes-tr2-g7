import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/pis/';

export const usePiStore = defineStore('pi', {
    state: () => ({
        pis: [],
        loading: false,
        error: null
    }),
    actions: {
        async fetchPIs() {
            const authStore = useAuthStore();
            this.loading = true;
            try {
                const response = await fetch(API_URL, {
                    headers: { 'Authorization': `Bearer ${authStore.token}` }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to fetch PIs');
                }

                this.pis = await response.json();
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async uploadPI(formData) {
            const authStore = useAuthStore();
            try {
                // fetch automatically sets Content-Type to multipart/form-data when body is FormData
                // Do NOT set Content-Type header manually
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authStore.token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Upload failed');
                }
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },
        async deletePI(id) {
            const authStore = useAuthStore();
            try {
                const response = await fetch(API_URL + id, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authStore.token}` }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Delete failed');
                }
            } catch (error) {
                this.error = error.message;
                throw error;
            }
        },
        // Socket event handler
        handleSocketUpdate(data) {
            if (data.type === 'create') {
                this.pis.unshift(data.pi);
            } else if (data.type === 'delete') {
                this.pis = this.pis.filter(pi => pi._id !== data.id);
            }
        }
    }
});
