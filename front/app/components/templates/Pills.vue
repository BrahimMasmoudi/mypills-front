<template>
  <OrganismsPills
      :medications="medications ?? []"
      :medication-loading="medicationLoading"
      @decrement-pills="(med, amount, done) => $emit('decrement-pills', med, amount, done)"
      @increment-pills="(med, amount, done) => $emit('increment-pills', med, amount, done)"
      @delete-pills="(med, done) => $emit('delete-pills', med, done)"
      @update-medication-name="(med, name, done) => $emit('update-medication-name', med, name, done)"

      @create-medication="$emit('create-medication', $event)"
  />
</template>

<script setup lang="ts">
import type {Medication} from "~/types/medication"

defineProps<{
  medications: Medication[] | undefined
  medicationLoading: boolean
}>()

defineEmits<{
  (e: 'create-medication', medication: Medication): void
  (e: 'increment-pills', medication: Medication, amount: number, done: () => void): void
  (e: 'decrement-pills', medication: Medication, amount: number, done: () => void): void
  (e: 'delete-pills', medication: Medication, done: () => void): void
  (e: 'update-medication-name', medication: Medication, newName: string, done: () => void): void
}>()
</script>