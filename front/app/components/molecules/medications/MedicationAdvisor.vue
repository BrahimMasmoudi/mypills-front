<template>
  <div class="max-w-2xl mx-auto p-4 space-y-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
        {{ t('medicationAdvisor.title') }}
      </h2>
      <p class="text-slate-600 dark:text-slate-400">
        {{ t('medicationAdvisor.description') }}
      </p>
    </div>

    <div class="space-y-4">
      <div class="relative">
        <textarea
          v-model="symptomInput"
          rows="4"
          class="w-full p-4 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
          :placeholder="t('medicationAdvisor.placeholder')"
        ></textarea>
      </div>

      <button
        @click="getAdvice"
        :disabled="isLoading"
        class="w-full py-3 px-6 text-white font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed rounded-lg shadow-md transition-all flex items-center justify-center space-x-2"
      >
        <span v-if="isLoading" class="flex items-center space-x-2">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ t('medicationAdvisor.buttonLoading') }}</span>
        </span>
        <span v-else>{{ t('medicationAdvisor.button') }}</span>
      </button>

      <!-- Error Message -->
      <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-700 text-sm font-medium">
          {{ errorMessage }}
        </p>
      </div>

      <!-- AI Response -->
      <div v-if="aiResponse" class="mt-8 space-y-4">
        <div class="flex items-center space-x-2 text-primary font-semibold">
          <v-icon icon="mdi-robot-outline" class="text-blue-600" />
          <span>{{ t('medicationAdvisor.suggestions') }}</span>
        </div>
        <div class="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl space-y-4">
          <div class="prose prose-blue dark:prose-invert max-w-none whitespace-pre-wrap text-slate-800 dark:text-slate-200">
            {{ aiResponse.explanation }}
          </div>
          <div v-if="aiResponse.usableMedications && aiResponse.usableMedications.length > 0" class="mt-4">
            <h4 class="font-semibold text-slate-900 dark:text-white mb-2">Usable Medications:</h4>
            <ul class="list-disc pl-5 text-slate-800 dark:text-slate-200">
              <li v-for="med in aiResponse.usableMedications" :key="med.medicationId || med.name">{{ med.name }} {{ med.quantity > 0 ? `(${med.quantity} remaining)` : '' }}</li>
            </ul>
          </div>
        </div>
        <p class="text-xs text-slate-400 italic">
          {{ t('medicationAdvisor.disclaimer') }}
        </p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useMedicationsStore } from '~/store/medications'
import { useI18n } from 'vue-i18n'
import type { Medication } from '~/types/medication'

const medicationsStore = useMedicationsStore()
const { t, locale } = useI18n()

const symptomInput = ref('')
const isLoading = ref(false)
const aiResponse = ref<{ explanation: string; usableMedications: Medication[] } | null>(null)
const errorMessage = ref('')

const getAdvice = async () => {
    if (!symptomInput.value.trim()) {
        errorMessage.value = t('medicationAdvisor.errorEmpty')
        return
    }

    isLoading.value = true
    aiResponse.value = null
    errorMessage.value = ''

    try {
        aiResponse.value = await medicationsStore.getMedicationAdvice(symptomInput.value, locale.value)
    } catch (error: any) {
        console.error('Advisor Error:', error)
        errorMessage.value = error.message || t('error')
    } finally {
        isLoading.value = false
    }
}
</script>
<style scoped>
/* Fallback if Tailwind is not fully configured */
.primary {
  color: #2563eb;
}
</style>
