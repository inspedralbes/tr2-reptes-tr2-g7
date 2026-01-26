<script setup>
import { ref, onMounted } from 'vue';
import { usePiStore } from '../../stores/pi';
import { useAuthStore } from '../../stores/auth';
import { storeToRefs } from 'pinia';

const piStore = usePiStore();
const authStore = useAuthStore();
const { pis, loading, error } = storeToRefs(piStore);

// Form Data
const studentName = ref('');
const file = ref(null);
const uploadLoading = ref(false);

onMounted(() => {
    piStore.fetchPIs();
});

const handleUpload = async () => {
    if (!file.value || !studentName.value) return;

    uploadLoading.value = true;
    const formData = new FormData();
    formData.append('studentName', studentName.value);
    const fileToUpload = Array.isArray(file.value) ? file.value[0] : file.value;
    if (fileToUpload) {
        formData.append('file', fileToUpload);
    }

    try {
        await piStore.uploadPI(formData);
        // Reset form
        studentName.value = '';
        file.value = null;
    } catch (e) {
        console.error(e);
    } finally {
        uploadLoading.value = false;
    }
};

const deletePI = async (id) => {
    if(confirm('Are you sure?')) {
        await piStore.deletePI(id);
    }
};

const logout = () => {
    authStore.logout();
};
</script>

<template>
  <v-container>
    <v-toolbar flat>
        <v-toolbar-title>Director Dashboard</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="red" @click="logout">Logout</v-btn>
    </v-toolbar>

    <v-row>
      <!-- Upload Section -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Upload PI</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleUpload">
              <v-text-field
                v-model="studentName"
                label="Student Name"
                prepend-icon="mdi-account-school"
                required
              ></v-text-field>
              <v-file-input
                v-model="file"
                label="Select File"
                prepend-icon="mdi-file-document"
                required
              ></v-file-input>
              <v-btn color="success" type="submit" :loading="uploadLoading" block>
                  Upload PI
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- List Section -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Managed Students</v-card-title>
          <v-card-text>
            <v-alert v-if="error" type="error">{{ error }}</v-alert>
            <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
            
            <v-list v-else>
                <v-list-item v-for="pi in pis" :key="pi._id" :title="pi.studentName" :subtitle="pi.originalFileName">
                    <template v-slot:append>
                        <v-btn icon="mdi-delete" color="error" variant="text" @click="deletePI(pi._id)"></v-btn>
                    </template>
                </v-list-item>
                <v-list-item v-if="pis.length === 0">No PIs uploaded yet.</v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
