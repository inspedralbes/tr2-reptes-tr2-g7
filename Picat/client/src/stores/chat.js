import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/chat/';

export const useChatStore = defineStore('chat', {
    state: () => ({
        messages: [],
        loading: false
    }),
    actions: {
        async sendMessage(studentId, message) {
            const authStore = useAuthStore();
            this.loading = true;

            // Add user message to local state
            this.messages.push({ sender: 'user', text: message });

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authStore.token}`
                    },
                    body: JSON.stringify({ studentId, message })
                });

                if (!response.ok) {
                    throw new Error('Failed to get AI response');
                }

                const data = await response.json();

                // Add AI response
                this.messages.push({ sender: 'ai', text: data.reply });
            } catch (error) {
                this.messages.push({ sender: 'system', text: 'Error communicating with AI' });
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        clearChat() {
            this.messages = [];
        }
    }
});
