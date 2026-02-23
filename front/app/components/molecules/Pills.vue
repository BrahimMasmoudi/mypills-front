<template>
  <v-sheet v-if="medications?.length ?? 0 > 0" width="100%">
    <v-row class="d-flex align-stretch justify-start mt-0 px-1">
      <v-col
        v-for="medication in medications"
        :key="medication.medicationId"
        md="3"
        cols="6"
      >
        <AtomsPill
          :medication="medication"
          @decrement-pills="(med, amount, done) => $emit('decrement-pills', med, amount, done)"
          @increment-pills="(med, amount, done) => $emit('increment-pills', med, amount, done)"
          @delete-pills="(med, done) => $emit('delete-pills', med, done)"
          @update-medication-name="(med, name, done) => $emit('update-medication-name', med, name, done)"
        />
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
import type { Medication } from '~/types/medication'

defineProps<{
  medications: Medication[] | undefined
}>()

defineEmits<{
  (e: 'increment-pills', medication: Medication, amount: number, done: () => void): void
  (e: 'decrement-pills', medication: Medication, amount: number, done: () => void): void
  (e: 'delete-pills', medication: Medication, done: () => void): void
  (e: 'update-medication-name', medication: Medication, newName: string, done: () => void): void
}>()
</script>