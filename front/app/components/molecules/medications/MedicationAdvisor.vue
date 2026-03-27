<template>
  <v-container max-width="800" class="pa-4">
    <v-card class="rounded-xl border pa-sm-4" elevation="1">
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold text-high-emphasis mb-1">
          {{ t('medicationAdvisor.title') }}
        </v-card-title>
        <v-card-subtitle class="text-body-1 text-medium-emphasis text-wrap">
          {{ t('medicationAdvisor.description') }}
        </v-card-subtitle>
      </v-card-item>

      <v-card-text class="pt-4">
        <v-textarea
          v-model="symptomInput"
          :placeholder="t('medicationAdvisor.placeholder')"
          variant="outlined"
          color="primary"
          auto-grow
          rows="4"
          hide-details="auto"
          class="mb-4"
        ></v-textarea>

        <v-btn
          @click="getAdvice"
          :loading="isLoading"
          :disabled="isLoading || !symptomInput.trim()"
          color="primary"
          size="x-large"
          block
          elevation="2"
          class="text-none font-weight-bold rounded-lg mb-4"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-robot-outline" />
          </template>
          {{ isLoading ? t('medicationAdvisor.buttonLoading') : t('medicationAdvisor.button') }}
        </v-btn>

        <v-expand-transition>
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            icon="mdi-alert-circle-outline"
            class="mb-4 rounded-lg"
          >
            {{ errorMessage }}
          </v-alert>
        </v-expand-transition>

        <v-expand-transition>
          <div v-if="aiResponse" class="mt-6">
            <v-card variant="tonal" color="primary" class="rounded-xl border border-primary border-opacity-25">
              <v-card-title class="d-flex align-center text-primary pb-0 pt-4">
                <v-icon icon="mdi-robot-outline" class="mr-2" />
                <span class="text-h6">{{ t('medicationAdvisor.suggestions') }}</span>
              </v-card-title>

              <v-card-text class="pt-4 pb-6 text-body-1 text-high-emphasis">
                <div class="mb-6" style="white-space: pre-wrap;">
                  {{ aiResponse.explanation }}
                </div>

                <div v-if="aiResponse.usableMedications && aiResponse.usableMedications.length > 0">
                  <div class="text-subtitle-1 font-weight-bold mb-4 text-high-emphasis">
                    Usable Medications:
                  </div>
                  <TemplatesPills
                    :medications="aiResponse.usableMedications"
                    :medication-loading="false"
                    @decrement-pills="(med, amount, done) => decrementPills(med, amount, done)"
                    @increment-pills="(med, amount, done) => incrementPills(med, amount, done)"
                    @delete-pills="(med, done) => deletePills(med, done)"
                    @update-medication-name="(med, name, done) => updateMedicationName(med, name, done)"
                    @create-medication="createMedication"
                  />
                </div>
              </v-card-text>
            </v-card>

            <div class="text-caption text-medium-emphasis text-center font-italic mt-4 px-4">
              {{ t('medicationAdvisor.disclaimer') }}
            </div>
          </div>
        </v-expand-transition>
      </v-card-text>
    </v-card>
  </v-container>
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

const createMedication = async (medication: Medication) => {
  await medicationsStore.createMedication(medication)
}

const incrementPills = async (medication: Medication, amount: number, done: () => void) => {
  try { await medicationsStore.incrementPills(medication, amount) } finally { done() }
}

const decrementPills = async (medication: Medication, amount: number, done: () => void) => {
  try { await medicationsStore.decrementPills(medication, amount) } finally { done() }
}

const deletePills = async (medication: Medication, done: () => void) => {
  try { await medicationsStore.deletePills(medication) } finally { done() }
}

const updateMedicationName = async (medication: Medication, newName: string, done: () => void) => {
  try { await medicationsStore.updateMedicationName(medication, newName) } finally { done() }
}
</script>
<style scoped>
/* Fallback if Tailwind is not fully configured */
.primary {
  color: #2563eb;
}
</style>
