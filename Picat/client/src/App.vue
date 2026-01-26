<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { io } from 'socket.io-client';
import { usePiStore } from './stores/pi';

const piStore = usePiStore();

onMounted(() => {
    const socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
        console.log('Connected to WebSocket server');
    });

    socket.on('pi:updated', (data) => {
        console.log('Real-time update received:', data);
        piStore.handleSocketUpdate(data);
    });
});
</script>

<template>
  <v-app>
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

