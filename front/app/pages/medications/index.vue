<template>
  <TemplatesPills
      :medications="medications ?? []"
      :medication-loading="medicationLoading"
      @decrement-pills="(med, done) => decrementPills(med, done)"
      @increment-pills="(med, done) => incrementPills(med, done)"
      @delete-pills="(med, done) => deletePills(med, done)"
      @update-medication-name="(med, name, done) => updateMedicationName(med, name, done)"
      @create-medication="createMedication"
  />
</template>

<script setup lang="ts">
import { useMedicationsStore } from "~/store/medications"
import type { Medication } from "~/types/medication"
import { useCountryStore } from "~/store/country"
import CountryDialog from "~/components/molecules/CountryDialog.vue"
import type { CreateReminderRequest } from "~/types/reminder"
import { useReminderStore } from "~/store/reminder"

const { $open } = useNuxtApp()
const countryStore = useCountryStore()
const notifications = useNotifications()

const medicationLoading = ref(true)
const medicationStore = useMedicationsStore()
const medications = computed(() => medicationStore.medications)
const reminderStore = useReminderStore()

onMounted(async () => {
  await medicationStore.initMedications()
  await checkCountryStatus()
  await notifications.registerNotificationToken()
  notifications.listenForMessages()
})

const checkCountryStatus = async () => {
  if (countryStore.selectedCountry === null) {
    const result = await $open<string | null>(CountryDialog, {
      scrim: true,
      isPersistent: true
    })

    if (result === 'FR') {
      countryStore.confirmFrance()
    } else {
      countryStore.clearCountry()
    }
  }
}

const createMedication = async (medication: Medication) => {
  await medicationStore.createMedication(medication)
}

const incrementPills = async (medication: Medication, done: () => void) => {
  try {
    await medicationStore.incrementPills(medication)
  } finally {
    done()
  }
}

const decrementPills = async (medication: Medication, done: () => void) => {
  try {
    await medicationStore.decrementPills(medication)
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
  medicationLoading.value = false
  if (newMeds.length > 0) {
    await handleExpiredMedications(newMeds as Medication[])
  }
}, { immediate: true })


</script>