<template>
  <v-dialog
      v-model="isActive"
      width="550"
      content-class="elevation-0"
      :class="$device.isMobile ? 'align-end ma-0' : ''"
      @keydown.esc="cancelAndClose"
  >
    <v-card class="rounded-xl pa-0 d-flex flex-column" elevation="24" :max-height="$device.isMobile ? '90vh' : '85vh'">
      <!-- Fixed Header -->
      <div class="pa-6 pb-0 flex-shrink-0">
        <v-sheet
            v-if="$device.isMobile"
            color="grey-lighten-2 mx-auto"
            height="4"
            width="40"
            class="rounded-pill mb-6"
        />

        <div class="d-flex flex-column align-center text-center">
          <v-avatar color="primary-lighten-5" size="64">
            <v-icon icon="mdi-alarm-plus" color="primary" size="46"/>
          </v-avatar>
          <v-card-title class="text-h5 font-weight-bold pt-0">
            {{ t('reminderDialog.createTitle') }}
          </v-card-title>
          <div class="text-body-2 text-medium-emphasis">
            {{ t('reminderDialog.createSubtitle') }}
          </div>
        </div>
      </div>

      <!-- Scrollable Content -->
      <v-card-text class="pa-6 pt-0 overflow-y-auto flex-grow-1">
        <div class="d-flex flex-column">
          <v-combobox
              v-model="form.sicknessName"
              :items="uniqueSicknessNames"
              :label="t('reminderDialog.sicknessNameLabel')"
              variant="outlined"
              hide-details="auto"
              rounded="lg"
              class="font-weight-medium my-4"
              :return-object="false"
          />
          <v-select
              v-model="form.medication"
              :items="validMedications"
              :label="t('dialogCreate.medicationLabel')"
              variant="outlined"
              rounded="lg"
              item-title="name"
              item-value="id"
              return-object
              prepend-inner-icon="mdi-pill"
              class="font-weight-medium"
          />

          <MoleculesReminderDatePicker
              v-model:startDate="form.startDate"
              v-model:endDate="form.endDate"
          />

          <div class="text-subtitle-2 font-weight-bold my-4">{{ t('reminderDialog.frequency') }}</div>
          <div
              v-for="(item, index) in form.doses"
              :key="index"
              class="d-flex align-center justify-space-between mb-4"
          >
            <MoleculesTimePicker
                v-model="item.time"
                class="mr-4 w-100"
            />

            <v-text-field
                v-model.number="item.quantity"
                type="number"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                width="80"
                class="flex-grow-0 flex-shrink-1"
                hide-details
            />

            <v-btn
                v-if="index !== 0"
                icon="mdi-close-circle-outline"
                variant="text"
                color="error"
                @click="removeDose(index)"
            />
          </div>

          <v-btn
              variant="tonal"
              color="primary"
              prepend-icon="mdi-plus"
              class="rounded-lg text-capitalize font-weight-bold"
              :disabled="form.doses.length >= MAX_DOSES"
              @click="addDose"
          >
            {{ t('reminderDialog.addDose') }}
          </v-btn>
          <div v-if="form.doses.length >= MAX_DOSES" class="text-caption text-error text-center mt-1">
            {{ t('reminderDialog.maxDosesHint', { count: MAX_DOSES }) }}
          </div>
        </div>
      </v-card-text>

      <v-divider v-if="!$device.isMobile" />

      <!-- Fixed Footer -->
      <v-card-actions class="w-100 justify-center pa-6 gap-3 flex-shrink-0">
        <v-btn variant="outlined" size="large" color="grey-darken-1"
               class="flex-grow-1 text-capitalize font-weight-bold" height="48" @click="cancelAndClose">
          {{ t('cancel') }}
        </v-btn>
        <v-btn :disabled="isFormInvalid"
               color="primary"
               variant="flat"
               size="large"
               class="flex-grow-1 text-capitalize font-weight-bold"
               height="48"
               :loading="loading"
               @click="handleSave">
          {{ t('confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n"
import {isSameDay, isAfter} from "date-fns"
import type {Medication} from "~/types/medication"
import type {CreateReminderRequest, Reminder} from "~/types/reminder"
import {enUS, fr} from "date-fns/locale"

const {$device} = useNuxtApp()
const {t, locale} = useI18n()

const locales: Record<string, any> = {en: enUS, fr: fr}
const MAX_DURATION_DAYS = 15
const MAX_DOSES = 3

// Props
const {close, createReminder, validMedications, reminders} = defineProps<{
  close: (value: string) => void
  isPersistent: boolean
  scrim: boolean
  createReminder: (createReminderRequest: CreateReminderRequest) => Promise<void>
  validMedications: Medication[]
  reminders: Reminder[]
}>()

const isActive = ref(true)
const loading = ref(false)
const form = ref({
  sicknessName: null as any,
  medication: null as unknown as Medication,
  startDate: new Date(),
  endDate: new Date(),
  doses: [
    {time: '08:00', quantity: 1}
  ]
})

const uniqueSicknessNames = computed(() => {
  const names = reminders
      .map((r) => r.sicknessName)
      .filter(Boolean)

  return [...new Set(names)]
});

const isFormInvalid = computed(() => {
  const hasName = !!form.value.sicknessName?.trim()
  const hasMed = !!form.value.medication
  const validDate =
      isAfter(form.value.endDate, form.value.startDate) ||
      isSameDay(form.value.endDate, form.value.startDate)
  const validDoses =
      form.value.doses.length > 0 &&
      form.value.doses.every(d => d.time && d.quantity > 0)

  return !hasMed || !validDate || !validDoses || !hasName
})

const addDose = () => {
  const lastDose = form.value.doses[form.value.doses.length - 1]!
  const [hours, minutes] = lastDose.time.split(':').map(Number)

  let newHours = hours! + 4
  if (newHours >= 24) newHours = 23

  const newTime = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  form.value.doses.push({time: newTime, quantity: 1})
}

const removeDose = (index: number) => form.value.doses.splice(index, 1)

const handleSave = async () => {
  loading.value = true
  try {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const payload = {
      ...form.value,
      startDate: form.value.startDate.toLocaleDateString('en-CA'),
      endDate: form.value.endDate.toLocaleDateString('en-CA'),
      timezone: userTimezone
    }

    await createReminder(payload as unknown as CreateReminderRequest)
    close('success')
  } catch (e) {
    console.error(e)
    close('error')
  } finally {
    loading.value = false
  }
}

const cancelAndClose = () => close('canceled')
</script>

<style scoped>
.gap-3 {
  gap: 12px
}

.gap-4 {
  gap: 16px
}

.cursor-pointer {
  cursor: pointer
}
</style>