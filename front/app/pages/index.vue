<template>
  <TemplatesPills :medications="medications ?? []"
                  :decrement-pills="decrementPills"
                  :increment-pills="incrementPills"
                  :delete-pills="deletePills"
                  :create-medication="createMedication"
                  :medication-loading="medicationLoading"
                  :update-medication-name="updateMedicationName"/>
</template>
<script setup lang="ts">

import {useMedicationsStore} from "~/store/medications";
import type {Medication} from "~/types/medication";

const medicationStore = useMedicationsStore()
const user = await getCurrentUser()
const medicationLoading = ref(true)
const medications = medicationStore.getMedications(user)

const createMedication = async (medication: Medication) => {
  await medicationStore.createMedication(medication)
}

const incrementPills = async (medication: Medication) => {
  await medicationStore.incrementPills(medication)
}
const decrementPills = async (medication: Medication) => {
  await medicationStore.decrementPills(medication)
}
const deletePills = async (medication: Medication) => {
  await medicationStore.deletePills(medication)
}

const updateMedicationName = async (medication: Medication, newName: string) => {
  await medicationStore.updateMedicationName(medication, newName)
}

// Check and update expired medications when data is loaded
watch(medications, async (newMeds) => {
  if (newMeds && newMeds.length > 0) {
    medicationLoading.value = false
    await medicationStore.checkAndUpdateExpiredMedications(newMeds as Medication[])
  }

  if(newMeds.length === 0) {
    medicationLoading.value = false
  }
})

</script>