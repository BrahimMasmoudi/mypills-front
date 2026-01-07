<template>
  <OrganismsPills :medications="medications"
                  :create-medication="createMedication"
                  :decrement-pills="decrementPills"
                  :increment-pills="incrementPills"
                  :delete-pills="deletePills"
                  :medication-loading="medicationLoading"
                  :update-medication-name="updateMedicationName"
                  :create-reminder="createReminder"
  />
</template>
<script setup lang="ts">
import type {Medication} from "~/types/medication";

defineProps<{
  medications: Medication[] | undefined
  createMedication: (medication: Medication) => Promise<void>
  incrementPills: (medication: Medication) => Promise<void>
  decrementPills: (medication: Medication) => Promise<void>
  deletePills: (medication: Medication) => Promise<void>
  updateMedicationName: (medication: Medication, newName: string) => Promise<void>
  createReminder: (createReminderRequest: any) => Promise<void>
  medicationLoading: boolean
}>()
</script>

<style scoped>

</style>