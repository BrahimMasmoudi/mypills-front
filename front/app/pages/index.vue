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

const medicationLoading = ref(true)

const medicationStore = useMedicationsStore()
const medications = computed(() => medicationStore.medications)

onMounted(() => {
  medicationStore.initMedications()
})

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

watch(medications,
    (newMeds: Medication[] | undefined) => {
      if (!newMeds) return

      medicationLoading.value = false

      if (newMeds.length > 0) {
        void handleExpiredMedications(newMeds as Medication[])
      }
    }
)
const handleExpiredMedications = async (meds: Medication[]) => {
  await medicationStore.checkAndUpdateExpiredMedications(meds)
}

</script>