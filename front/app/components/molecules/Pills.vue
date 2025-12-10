<template>
  <v-sheet width="100%" v-if="medications?.length ?? 0 > 0">
    <v-row class="d-flex align-stretch justify-start mt-0">
      <v-col
          md="3"
          cols="6"
          v-for="medication in medications"
          :key="medication.medicationId"
      >
        <AtomsPill
            :is-expired="isExpired"
            :medication="medication"
            :decrement-pills="decrementPills"
            :increment-pills="incrementPills"
            :delete-pills="deletePills"
            :update-medication-name="updateMedicationName"
        />
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import type {Medication} from '~/types/medication'

const {t} = useI18n()
const {$device} = useNuxtApp()

const {isExpired, medications, incrementPills, decrementPills, deletePills, updateMedicationName} = defineProps<{
  isExpired: boolean
  medications: Medication[] | undefined
  incrementPills: (medication: Medication) => Promise<void>
  decrementPills: (medication: Medication) => Promise<void>
  deletePills: (medication: Medication) => Promise<void>
  updateMedicationName: (medication: Medication, newName: string) => Promise<void>
}>()
</script>
