<template>
  <v-container max-width="1200" class="pa-2 pa-md-4">
    
    <div class="mb-6 mb-md-8 px-2 px-md-0">
      <h2 class="text-h5 text-md-h4 font-weight-bold text-high-emphasis mb-2 d-flex align-center">
        <v-icon icon="mdi-robot-outline" color="primary" class="mr-3" />
        {{ t('medicationAdvisor.title') }}
      </h2>
      <p class="text-body-2 text-md-body-1 text-medium-emphasis">
        {{ t('medicationAdvisor.description') }}
      </p>
    </div>

    <v-row>
      <v-col cols="12" md="5" class="d-flex flex-column gap-3 gap-md-4 align-self-start">
        
        <v-alert
          type="warning"
          variant="tonal"
          color="amber-darken-3"
          :density="$vuetify.display.smAndDown ? 'compact' : 'default'"
          prominent
          class="border rounded-lg flex-grow-0 d-flex mb-2 mb-md-4"
          icon="mdi-alert"
        >
          <span class="text-caption text-md-body-2 font-weight-bold">
            {{ t('medicationAdvisor.strictDisclaimer') }}
          </span>
        </v-alert>

        <v-card class="rounded-xl border pa-1 shadow-sm" elevation="0">
          <v-card-text class="pa-3 pa-md-4">
            <v-textarea
              v-model="symptomInput"
              :placeholder="t('medicationAdvisor.placeholder')"
              variant="outlined"
              color="primary"
              :rows="$vuetify.display.smAndDown ? 3 : 5"
              hide-details="auto"
              :disabled="hasReachedLimit"
              class="mb-4"
            ></v-textarea>

            <v-alert
              v-if="hasReachedLimit"
              type="error"
              variant="tonal"
              density="compact"
              icon="mdi-clock-alert-outline"
              class="mb-4 rounded-lg"
            >
              {{ t('medicationAdvisor.quotaExceeded') }}
            </v-alert>

            <v-btn
              @click="getAdvice"
              :loading="isLoading"
              :disabled="isLoading || !symptomInput.trim() || hasReachedLimit"
              color="primary"
              size="x-large"
              block
              elevation="0"
              class="text-none font-weight-bold rounded-lg bg-primary"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-sparkles" />
              </template>
              {{ t('medicationAdvisor.button') }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="7" id="ai-response-area">
        
        <v-card
          v-if="!aiResponse && !isLoading && !errorMessage"
          class="d-none d-md-flex h-100 rounded-xl border border-dashed align-center justify-center pa-8 bg-grey-lighten-4"
          elevation="0"
          style="min-height: 300px;"
        >
          <div class="text-center text-medium-emphasis">
            <v-icon icon="mdi-forum-outline" size="64" class="mb-4 opacity-50" />
            <div class="text-h6 font-weight-medium">Ready to assist</div>
            <div class="text-body-2">Describe your symptom on the left to get started.</div>
          </div>
        </v-card>

        <v-card v-if="isLoading" class="h-100 rounded-xl border pa-4 pa-md-6" elevation="0">
          <v-skeleton-loader type="article, list-item-avatar-two-line" color="transparent"></v-skeleton-loader>
        </v-card>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="flat"
          class="rounded-xl mt-4 mt-md-0"
        >
          {{ errorMessage }}
        </v-alert>

        <v-card
          v-if="aiResponse && !isLoading"
          class="rounded-xl border border-primary shadow-sm overflow-hidden h-100 flex-column d-flex mt-4 mt-md-0"
          elevation="0"
        >
          <div class="bg-primary-lighten-5 px-4 px-md-6 py-3 py-md-4 border-b">
            <div class="d-flex align-center text-primary font-weight-bold">
              <v-icon icon="mdi-check-decagram" class="mr-2" />
              <span class="text-body-1 text-md-h6">{{ t('medicationAdvisor.suggestions') }}</span>
            </div>
          </div>

          <v-card-text class="pa-4 pa-md-6 d-flex flex-column gap-4 gap-md-6">
            <div class="text-body-2 text-md-body-1 text-high-emphasis" style="line-height: 1.6; white-space: pre-wrap;">
              {{ aiResponse.explanation }}
            </div>

            <div v-if="aiResponse.usableMedications?.length" class="mt-2 mt-md-4">
              <div class="text-caption text-md-overline font-weight-bold text-medium-emphasis mb-2">
                {{ t('medicationAdvisor.usableMedications') }}
              </div>
              
             <div class="d-flex flex-wrap" style="gap: 8px;">
              <v-chip
                v-for="med in aiResponse.usableMedications"
                :key="med.medicationId"
                color="primary"
                variant="tonal"
                :size="$vuetify.display.smAndDown ? 'default' : 'large'"
                class="font-weight-bold px-3 px-md-4"
              >
                <template v-slot:prepend>
                  <v-icon icon="mdi-pill" start></v-icon>
                </template>
                {{ med.name }}
              </v-chip>
            </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMedicationsStore } from '~/store/medications'
import { useI18n } from 'vue-i18n'
import type { Medication } from '~/types/medication'

const medicationsStore = useMedicationsStore()
const { hasReachedLimit } = storeToRefs(medicationsStore)
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
.gap-4 {
  gap: 16px;
}
.gap-6 {
  gap: 24px;
}
.bg-primary-lighten-5 {
  background-color: #f0f4ff; /* Fallback light blue, replace with your Vuetify theme color if needed */
}
</style>