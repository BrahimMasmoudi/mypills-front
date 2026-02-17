<template>
  <div class="d-flex flex-column h-100">
    <v-sheet class="w-100 flex-shrink-0" min-height="60">
      <v-tabs
          v-model="modelValue"
          align-tabs="center"
          class="mt-2 w-100"
          hide-slider
          height="48"
          :selected-class="modelValue === 'valid' ? 'bg-green-lighten' : (modelValue === 'expired' ? 'bg-error' : 'bg-primary')"
      >
        <v-tab
            value="all"
            class="text-capitalize font-weight-bold text-subtitle-1 rounded-pill text-primary"
            :class="{'bg-primary-lighten': modelValue === 'all'}"
            color="primary"
            variant="text"
        >
          <template #prepend v-if="!$device.isMobile">
            <v-icon icon="mdi-earth" color="primary"/>
          </template>
          {{ $device.isMobile ? t('meds.all') : t('meds.all_long') }}
          <v-badge :content="allMedication.length" color="primary" inline/>
        </v-tab>

        <v-tab
            value="valid"
            class="text-capitalize font-weight-bold text-subtitle-1 rounded-pill text-green"
            :class="{'bg-green-lighten': modelValue === 'valid'}"
            color="green"
            variant="text"
        >
          <template #prepend v-if="!$device.isMobile">
            <nuxt-icon name="validate-edit-action"/>
          </template>
          {{ $device.isMobile ? t('meds.valid') : t('meds.valid_long') }}
          <v-badge :content="validMedication.length" color="green" inline/>
        </v-tab>

        <v-tab
            value="expired"
            class="text-capitalize font-weight-bold text-subtitle-1 rounded-pill text-error"
            :class="{'bg-error-lighten': modelValue === 'expired'}"
            color="error"
            variant="text"
        >
          <template #prepend v-if="!$device.isMobile">
            <nuxt-icon name="error-warning"/>
          </template>
          {{ $device.isMobile ? t('meds.expired') : t('meds.expired_long') }}
          <v-badge :content="expiredMedication.length" color="error" inline/>
        </v-tab>
      </v-tabs>
    </v-sheet>

    <v-sheet class="flex-grow-1 overflow-hidden position-relative rounded-lg">
      <v-window v-model="modelValue" class="h-100">
        <v-window-item v-for="tabType in ['all', 'valid', 'expired']" :key="tabType" :value="tabType" class="h-100">
          <div
              :class="['h-100 px-1 pt-2', viewType === 'grid' ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden']">
            <template v-if="getMedicationList(tabType).length > 0">
              <MoleculesPills
                  v-if="viewType === 'grid'"
                  :medications="getMedicationList(tabType)"
                  @decrement-pills="(med, amount, done) => $emit('decrement-pills', med, amount, done)"
                  @increment-pills="(med, amount, done) => $emit('increment-pills', med, amount, done)"
                  @delete-pills="(med, done) => $emit('delete-pills', med, done)"
                  @update-medication-name="(med, name, done) => $emit('update-medication-name', med, name, done)"
              />
              <MoleculesMedicationsTable
                  v-else-if="viewType === 'table' && !$device.isMobile"
                  :medications="getMedicationList(tabType)"
                  @decrement-pills="(med, amount, done) => $emit('decrement-pills', med, amount, done)"
                  @increment-pills="(med, amount, done) => $emit('increment-pills', med, amount, done)"
                  @delete-pills="(med, done) => $emit('delete-pills', med, done)"
                  @update-medication-name="(med, name, done) => $emit('update-medication-name', med, name, done)"
              />
            </template>
            <v-sheet v-else width="100%" height="100%" class="d-flex flex-column align-center font-weight-bold">
              <v-img
                  :src="useAsset(colorMode.value === 'dark' ? '/assets/img/no-result-dark.png' : '/assets/img/no-result.png')"
                  max-height="400" width="400"/>
              {{ t('meds.no-result') }}
            </v-sheet>
          </div>
        </v-window-item>
      </v-window>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import type {Medication} from "~/types/medication";
import {useI18n} from "vue-i18n";
import MoleculesPills from "~/components/molecules/Pills.vue";
import {useAsset} from "#imports";

const {t} = useI18n()
const {$device} = useNuxtApp()
const colorMode = useColorMode()

const modelValue = defineModel()

const {allMedication, validMedication, expiredMedication} = defineProps<{
  viewType: 'grid' | 'table'
  allMedication: Medication[]
  validMedication: Medication[]
  expiredMedication: Medication[]
}>()

defineEmits<{
  (e: 'increment-pills', medication: Medication, amount: number, done: () => void): void
  (e: 'decrement-pills', medication: Medication, amount: number, done: () => void): void
  (e: 'delete-pills', medication: Medication, done: () => void): void
  (e: 'update-medication-name', medication: Medication, newName: string, done: () => void): void
}>()

const getMedicationList = (type: string) => {
  if (type === 'valid') return validMedication
  if (type === 'expired') return expiredMedication
  return allMedication
}
</script>

<style scoped>
.tab-active {
  background-color: rgba(var(--v-theme-primary), 0.1);
  transition: all 0.3s ease;
}

.bg-primary-lighten {
  background-color: rgba(var(--v-theme-primary), 0.2) !important;
}

.bg-green-lighten {
  background-color: rgba(76, 175, 80, 0.2) !important;
}

.bg-error-lighten {
  background-color: rgba(var(--v-theme-error), 0.2) !important;
}

.v-tabs--density-default {
  height: 60px !important;
}
</style>