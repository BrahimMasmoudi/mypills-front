<template>
  <div class="d-flex flex-column h-100">
    <!-- Fixed Tabs Header -->
    <v-sheet class="w-100 flex-shrink-0" min-height="60">
      <v-tabs
          :model-value="modelValue"
          @update:model-value="$emit('update:modelValue', $event)"
          align-tabs="center"
          class="mt-2 w-100"
          hide-slider
          height="48"
          :selected-class="modelValue === 'valid' ? 'bg-primary-lighten' : 'bg-error-lighten'"
      >
        <v-tab
            value="valid"
            class="text-capitalize font-weight-bold text-subtitle-1 rounded-pill text-primary"
            :class="{'bg-primary-lighten': modelValue === 'valid'}"
            color="primary"
            variant="text"
        >
          <template #prepend v-if="!$device.isMobile">
            <nuxt-icon name="validate-edit-action"/>
          </template>
          {{ $device.isMobile ? t('meds.valid') : t('meds.valid_long') }}
          <v-badge
              :content="validMedication.length"
              color="primary"
              inline
          />
        </v-tab>

        <v-tab
            value="expired"
            class="text-capitalize font-weight-bold text-subtitle-1 rounded-pill text-error"
            :color="modelValue === 'expired' ? 'error' : 'default'"
            variant="text"
        >
          <template #prepend v-if="!$device.isMobile">
            <nuxt-icon name="error-warning"/>
          </template>
          {{ $device.isMobile ? t('meds.expired') : t('meds.expired_long') }}
          <v-badge
              :content="expiredMedication.length"
              color="error"
              inline
          />
        </v-tab>
      </v-tabs>
    </v-sheet>

    <!-- Scrollable Window Content -->
    <v-sheet class="flex-grow-1 overflow-hidden position-relative rounded-lg">
       <v-window :model-value="modelValue" class="w-100 h-100">
        <v-window-item value="valid" class="h-100 overflow-y-auto overflow-x-hidden">
          <MoleculesPills
              v-if="validMedication.length > 0 && viewType === 'grid'"
              :is-expired="false"
              :medications="validMedication"
              :increment-pills="incrementPills"
              :decrement-pills="decrementPills"
              :delete-pills="deletePills"
              :update-medication-name="updateMedicationName"
          />
          <MoleculesMedicationTable
              v-else-if="validMedication.length > 0 && viewType === 'table' && !$device.isMobile"
              :is-expired="false"
              :medications="validMedication"
              :increment-pills="incrementPills"
              :decrement-pills="decrementPills"
              :delete-pills="deletePills"
              :update-medication-name="updateMedicationName"
          />
          <v-sheet width="100%" height="100%" v-else
                   class="d-flex flex-column align-center justify-center font-weight-bold">
            <v-img :src="useAsset('/assets/img/no-result.png')" max-height="200" width="200"/>
            {{ t('meds.no-result') }}
          </v-sheet>
        </v-window-item>

        <v-window-item value="expired" class="h-100 overflow-y-auto">
          <MoleculesPills
              v-if="expiredMedication.length > 0 && viewType === 'grid'"
              :is-expired="true"
              :medications="expiredMedication"
              :increment-pills="incrementPills"
              :decrement-pills="decrementPills"
              :delete-pills="deletePills"
              :update-medication-name="updateMedicationName"/>
          
          <MoleculesMedicationTable
              v-else-if="expiredMedication.length > 0 && viewType === 'table' && !$device.isMobile"
              :is-expired="true"
              :medications="expiredMedication"
              :increment-pills="incrementPills"
              :decrement-pills="decrementPills"
              :delete-pills="deletePills"
              :update-medication-name="updateMedicationName"
          />

          <v-sheet width="100%" height="100%" v-else
                   class="d-flex flex-column align-center justify-center font-weight-bold">
            <v-img :src="useAsset('/assets/img/no-result-new.png')" max-height="400" width="400"/>
            {{ t('meds.no-result') }}
          </v-sheet>
        </v-window-item>
      </v-window>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import type {Medication} from "~/types/medication";
import {useI18n} from "vue-i18n";
import MoleculesPills from "~/components/molecules/Pills.vue";
import { useAsset } from "#imports";

const {t} = useI18n()
const {$device} = useNuxtApp()

defineProps<{
  modelValue: string
  viewType: 'grid' | 'table'
  validMedication: Medication[]
  expiredMedication: Medication[]
  incrementPills: (medication: Medication) => Promise<void>
  decrementPills: (medication: Medication) => Promise<void>
  deletePills: (medication: Medication) => Promise<void>
  updateMedicationName: (medication: Medication, newName: string) => Promise<void>
}>()

defineEmits<{
  (e: 'update:modelValue', value: unknown): void
}>()
</script>

<style scoped>
.tab-active {
  background-color: rgba(var(--v-theme-primary), 0.1);
  transition: all 0.3s ease;
}

.bg-primary-lighten {
  background-color: rgba(var(--v-theme-primary), 0.2) !important;
}

.bg-error-lighten {
  background-color: rgba(var(--v-theme-error), 0.2) !important;
}

.v-tabs--density-default {
  height: 60px !important;
}
</style>
