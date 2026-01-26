<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const username = ref('');
const password = ref('');
const role = ref('master');
const loading = ref(false);
const message = ref('');
const error = ref('');

const roles = ['director', 'master']; // Admin creates these

const userList = ref([]);

// Fetch users on mount
import { onMounted } from 'vue';

const fetchUsers = async () => {
    try {
        userList.value = await authStore.fetchUsers();
    } catch (e) {
        console.error(e);
    }
};

onMounted(() => {
    fetchUsers();
});

const handleRegister = async () => {
    loading.value = true;
    message.value = '';
    error.value = '';
    
    try {
        await authStore.register({ 
            username: username.value, 
            password: password.value, 
            role: role.value 
        });
        message.value = `User ${username.value} created successfully!`;
        username.value = '';
        password.value = '';
        // Refresh list
        await fetchUsers();
    } catch (e) {
        error.value = e.message;
    } finally {
        loading.value = false;
    }
};

const handleDelete = async (id, name) => {
    if(confirm(`Are you sure you want to delete ${name}?`)) {
        try {
            await authStore.deleteUser(id);
            await fetchUsers();
        } catch(e) {
            alert(e.message);
        }
    }
};

const logout = () => {
    authStore.logout();
};
</script>

<template>
  <v-container>
    <v-toolbar flat color="grey-darken-3">
        <v-toolbar-title>Admin Dashboard</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="logout">Logout</v-btn>
    </v-toolbar>

    <v-row class="mt-5" justify="center">
      <v-col cols="12" md="6">
        <!-- Register Form -->
        <v-card class="mb-4">
            <v-card-title>Create New User</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="handleRegister">
                    <v-text-field
                        v-model="username"
                        label="Username"
                        required
                    ></v-text-field>
                    <v-text-field
                        v-model="password"
                        label="Password"
                        type="password"
                        required
                    ></v-text-field>
                    <v-select
                        v-model="role"
                        :items="roles"
                        label="Role"
                        required
                    ></v-select>
                    
                    <v-btn color="primary" type="submit" :loading="loading" block>Create User</v-btn>
                </v-form>
                
                <v-alert v-if="message" type="success" class="mt-3">{{ message }}</v-alert>
                <v-alert v-if="error" type="error" class="mt-3">{{ error }}</v-alert>
            </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6">
        <!-- User List -->
         <v-card>
            <v-card-title>Manage Users</v-card-title>
            <v-card-text>
                <v-list>
                    <v-list-item v-for="user in userList" :key="user._id" :title="user.username" :subtitle="user.role">
                        <template v-slot:append>
                            <v-btn 
                                icon="mdi-delete" 
                                color="error" 
                                variant="text" 
                                :disabled="user.role === 'admin' && user.username === 'Daniel'"
                                @click="handleDelete(user._id, user.username)"
                            ></v-btn>
                        </template>
                    </v-list-item>
                    <v-list-item v-if="userList.length === 0">No users found.</v-list-item>
                </v-list>
            </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
