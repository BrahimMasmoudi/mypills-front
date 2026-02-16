<template>
  <TemplatesPills
      :medications="medications ?? []"
      :medication-loading="isLoading"
      @decrement-pills="(med, amount, done) => decrementPills(med, amount, done)"
      @increment-pills="(med, amount, done) => incrementPills(med, amount, done)"
      @delete-pills="(med, done) => deletePills(med, done)"
      @update-medication-name="(med, name, done) => updateMedicationName(med, name, done)"
      @create-medication="createMedication"
  />
</template>

<script setup lang="ts">
import {useMedicationsStore} from "~/store/medications"
import type {Medication} from "~/types/medication"
import {useI18n} from "vue-i18n";

const {t} = useI18n()
useSeoMeta({
  title: () => t('nav.medications')
})

const medicationStore = useMedicationsStore()
const {isLoading, medications} = storeToRefs(medicationStore)

const createMedication = async (medication: Medication) => {
  await medicationStore.createMedication(medication)
}

const incrementPills = async (medication: Medication, amount: number, done: () => void) => {
  try {
    await medicationStore.incrementPills(medication, amount)
  } finally {
    done()
  }
}

const decrementPills = async (medication: Medication, amount: number, done: () => void) => {
  try {
    await medicationStore.decrementPills(medication, amount)
  } finally {
    done()
  }
}

const deletePills = async (medication: Medication, done: () => void) => {
  try {
    await medicationStore.deletePills(medication)
  } finally {
    done()
  }
}

const updateMedicationName = async (medication: Medication, newName: string, done: () => void) => {
  try {
    await medicationStore.updateMedicationName(medication, newName)
  } finally {
    done()
  }
}

const handleExpiredMedications = async (meds: Medication[]) => {
  await medicationStore.checkAndUpdateExpiredMedications(meds)
}

watch(medications, async (newMeds: Medication[] | undefined) => {
  if (!newMeds) return
  if (newMeds.length > 0) {
    await handleExpiredMedications(newMeds as Medication[])
  }
}, {immediate: true})
</script>