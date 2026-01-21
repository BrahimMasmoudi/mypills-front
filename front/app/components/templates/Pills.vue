<template>
  <OrganismsPills
      :medications="medications ?? []"
      :medication-loading="medicationLoading"
      @decrement-pills="(med, done) => $emit('decrement-pills', med, done)"
      @increment-pills="(med, done) => $emit('increment-pills', med, done)"
      @delete-pills="(med, done) => $emit('delete-pills', med, done)"
      @update-medication-name="(med, name, done) => $emit('update-medication-name', med, name, done)"

      @create-medication="$emit('create-medication', $event)"
      @create-reminder="$emit('create-reminder', $event)"
  />
</template>

<script setup lang="ts">
import type {Medication} from "~/types/medication"
import type {CreateReminderRequest} from "~/types/reminder"

defineProps<{
  medications: Medication[] | undefined
  medicationLoading: boolean
}>()

defineEmits<{
  (e: 'create-medication', medication: Medication): void
  (e: 'increment-pills', medication: Medication, done: () => void): void
  (e: 'decrement-pills', medication: Medication, done: () => void): void
  (e: 'delete-pills', medication: Medication, done: () => void): void
  (e: 'update-medication-name', medication: Medication, newName: string, done: () => void): void
  (e: 'create-reminder', request: CreateReminderRequest): void
}>()
</script>