<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
    // Redirect to login for now
   router.push('/login');
});
</script>

<template>
  <v-container>
      <h1>Welcome to Picat</h1>
      <v-btn to="/login" color="primary">Login</v-btn>
  </v-container>
</template>
