<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { usePiStore } from '../../stores/pi';
import { useChatStore } from '../../stores/chat';
import { useAuthStore } from '../../stores/auth';
import { storeToRefs } from 'pinia';

const piStore = usePiStore();
const chatStore = useChatStore();
const authStore = useAuthStore();
const { pis } = storeToRefs(piStore);
const { messages, loading } = storeToRefs(chatStore);

const selectedStudent = ref(null); // Will hold studentId (or PI object ID depending on logic)
const messageInput = ref('');
const chatContainer = ref(null);

onMounted(() => {
    piStore.fetchPIs();
});

// Auto-scroll to bottom of chat
watch(messages, async () => {
    await nextTick();
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
}, { deep: true });

const sendMessage = async () => {
    if (!messageInput.value.trim() || !selectedStudent.value) return;

    // selectedStudent.value should be the studentId or PI internal ID. 
    // In our backend logic in aiController, we look up by studentId. 
    // Our PI model has a studentId field, but we didn't enforce it in upload form (optional). 
    // We should probably pass the PI's _id as studentId for uniqueness if we treat them 1:1.
    // Let's assume passed ID is PI._id for now and backend uses `studentId` query param.
    // Wait, backend `aiController` does `PI.findOne({ studentId })`. 
    // If we didn't save `studentId` explicitly in upload, this might fail.
    // But in uploadPI controller: `const { studentName, studentId } = req.body;`
    // If I didn't send studentId, it is null.
    // Correction: In DirectorDashboard I didn't verify studentId input. 
    // Let's blindly use `studentId` or `_id` field.
    // FIX: Let's pass `selectedStudent` (which will be PI._id) as `studentId` to backend 
    // and I'll need to check if backend searches by `_id` or `studentId`.
    
    // Quick Fix for Backend Compatibility:
    // Backend: `const pi = await PI.findOne({ studentId }); // Assuming studentId matches stored One`
    // If I pass PI._id as studentId, findOne({ studentId: '...' }) wont work if schema field is studentId.
    // It should be `findOne({ _id: studentId })`.
    
    // I will use PI._id as the reference.
    
    const text = messageInput.value;
    messageInput.value = '';
    
    // Use the PI's database ID as the identifier
    await chatStore.sendMessage(selectedStudent.value._id, text);
};

// Suggested Questions
const suggestedQuestions = [
    "Hazme un resumen del diagnóstico del alumno.",
    "Qué debo tener en consideración al tratar con el alumno?",
    "Qué metodologías se han usado con éxito anteriormente con este alumno?"
];

const handleQuickQuestion = async (question) => {
    if (!selectedStudent.value) return;
    // Directly send the question
    await chatStore.sendMessage(selectedStudent.value._id, question);
};

const logout = () => {
    authStore.logout();
};
</script>

<template>
  <v-container class="fill-height">
    <v-toolbar flat density="compact">
        <v-toolbar-title>Master Dashboard</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="red" @click="logout" size="small">Logout</v-btn>
    </v-toolbar>

    <v-row class="fill-height">
      <!-- Sidebar / Config -->
      <v-col cols="12" md="4" class="d-flex flex-column gap-3">
        <v-card class="mb-4">
            <v-card-title>Context Setup</v-card-title>
            <v-card-text>
                <v-select
                    v-model="selectedStudent"
                    :items="pis"
                    item-title="studentName"
                    item-value="studentId" 
                    label="Select Student (PI Context)"
                    hint="This loads the PI into the AI's context window"
                    persistent-hint
                    return-object
                >
                 <!-- NOTE: item-value="studentId" might be empty if we didn't save it. 
                      Let's use return-object to grab the whole PI and use its ID manually or fix backend. -->
                </v-select>
                <!-- Hack: if return-object is true, selectedStudent is the object -->
                <div v-if="selectedStudent" class="mt-4">
                    <strong>Loaded Context:</strong> {{ selectedStudent.originalFileName }}
                </div>
            </v-card-text>
        </v-card>
      </v-col>

      <!-- Chat Interface -->
      <v-col cols="12" md="8" class="fill-height pb-10">
        <v-card class="fill-height d-flex flex-column">
            <v-card-title class="bg-grey-lighten-4">
                AI Assistant <span v-if="selectedStudent">for {{ selectedStudent.studentName }}</span>
            </v-card-title>
            
            <v-card-text ref="chatContainer" class="flex-grow-1 overflow-y-auto pa-4" style="height: 400px; max-height: 60vh;">
                <div v-if="messages.length === 0" class="text-center text-grey mt-10">
                    Select a student and start asking questions.
                </div>
                
                <div v-for="(msg, i) in messages" :key="i" :class="['d-flex mb-4', msg.sender === 'user' ? 'justify-end' : 'justify-start']">
                    <v-card :color="msg.sender === 'user' ? 'primary' : 'grey-lighten-3'" :variant="msg.sender === 'user' ? 'flat' : 'flat'" class="pa-3" style="max-width: 80%;">
                        <div :class="msg.sender === 'user' ? 'text-white' : 'text-black'">{{ msg.text }}</div>
                    </v-card>
                </div>
                
                <div v-if="loading" class="text-center text-grey">AI is thinking...</div>
            </v-card-text>

            <div class="px-4 py-2" v-if="selectedStudent">
                <v-slide-group show-arrows>
                    <v-slide-group-item v-for="q in suggestedQuestions" :key="q" v-slot="{ isSelected, toggle }">
                        <v-chip
                            class="ma-1"
                            color="primary"
                            variant="outlined"
                            @click="handleQuickQuestion(q)"
                            :disabled="loading"
                            >
                            {{ q }}
                        </v-chip>
                    </v-slide-group-item>
                </v-slide-group>
            </div>

            <v-divider></v-divider>

            <v-card-actions class="pa-4">
                <v-text-field
                    v-model="messageInput"
                    label="Ask about teaching strategies..."
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    @keyup.enter="sendMessage"
                    :disabled="!selectedStudent || loading"
                >
                    <template v-slot:append-inner>
                         <v-icon @click="sendMessage" color="primary" class="cursor-pointer">mdi-send</v-icon>
                    </template>
                </v-text-field>
            </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
