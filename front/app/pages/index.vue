<template>
  <TemplatesPills :medications="medications ?? []"
                  :decrement-pills="decrementPills"
                  :increment-pills="incrementPills"
                  :delete-pills="deletePills"
                  :create-medication="createMedication"
                  :medication-loading="medicationLoading"
                  :update-medication-name="updateMedicationName"
                  :create-reminder="createReminder"/>
</template>
<script setup lang="ts">

import {useMedicationsStore} from "~/store/medications";
import type {Medication} from "~/types/medication";
import {useCountryStore} from "~/store/country";
import CountryDialog from "~/components/molecules/CountryDialog.vue";
import type {CreateReminderRequest} from "~/types/reminder";
import {useReminderStore} from "~/store/reminder";

const {$open} = useNuxtApp();
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

const createReminder = async (reminderRequest: CreateReminderRequest) => {
  console.log(reminderRequest)
  await reminderStore.createSchedule(reminderRequest)
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