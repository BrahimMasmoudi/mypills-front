<template>
  <v-dialog
      v-model="isActive"
      :persistent="isPersistent"
      :scrim="scrim"
      :class="$device.isMobile ? 'align-end ma-0' : ''"
      @keydown.esc="cancelAndClose"
      width="550"
      content-class="elevation-0"
      @update:model-value="(val) => !val && cancelAndClose()"
  >
    <v-card
        class="rounded-xl pa-0 d-flex flex-column"
        elevation="24"
        :max-height="$device.isMobile ? '90vh' : '85vh'"
    >
      <div class="pa-6 pb-0">
        <v-sheet
            v-if="$device.isMobile"
            color="grey-lighten-2 mx-auto"
            height="4"
            width="40"
            class="rounded-pill mb-6"
        />

        <div class="d-flex flex-column align-center text-center mb-6">
          <v-avatar color="primary-lighten-5" size="64">
            <v-icon icon="mdi-pencil" color="primary" size="46"/>
          </v-avatar>
          <v-card-title class="text-h5 font-weight-bold pt-0">
            {{ t('reminderDialog.editTitle') || 'Edit Reminder' }}
          </v-card-title>
          <div class="text-body-2 text-medium-emphasis">
            {{ t('reminderDialog.editSubtitle') || 'Modify your reminder details' }}
          </div>
        </div>
      </div>

      <v-card-text class="pa-6 pt-2 overflow-y-auto flex-grow-1">
        <div class="d-flex flex-column gap-4">
          <v-combobox
              v-model="form.sicknessName"
              :items="uniqueSicknessNames"
              :label="t('reminderDialog.sicknessNameLabel')"
              variant="outlined"
              hide-details="auto"
              rounded="lg"
              class="font-weight-medium"
              :return-object="false"
          />

          <div v-for="(med, medIndex) in form.medications" :key="medIndex" class="pa-4 rounded-lg border mb-4">
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="text-subtitle-1 font-weight-bold d-flex align-center">
                <v-icon icon="mdi-pill" color="primary" class="mr-2"/>
                Medication #{{ medIndex + 1 }}
              </div>
              <v-btn
                  v-if="form.medications.length > 1"
                  icon="mdi-delete-outline"
                  variant="text"
                  color="error"
                  size="small"
                  @click="removeMedication(medIndex)"
              />
            </div>

            <v-select
                v-model="med.medication"
                :items="validMedications"
                :label="t('dialogCreate.medicationLabel')"
                variant="outlined"
                rounded="lg"
                item-title="name"
                item-value="id"
                return-object
                prepend-inner-icon="mdi-pill"
                class="font-weight-medium mb-4"
                hide-details="auto"
            />

            <MoleculesReminderDatePicker
                v-model:startDate="med.startDate"
                v-model:endDate="med.endDate"
            />

            <div class="text-subtitle-2 font-weight-bold mb-3">{{ t('reminderDialog.frequency') }}</div>
            <div
                v-for="(dose, doseIndex) in med.doses"
                :key="doseIndex"
                class="d-flex align-center justify-space-between mb-3"
            >
              <MoleculesTimePicker
                  v-model="dose.time"
                  class="mr-4 w-100"
              />

              <v-text-field
                  v-model.number="dose.quantity"
                  type="number"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  width="80"
                  class="flex-grow-0 flex-shrink-1"
                  hide-details
              />

              <v-btn
                  v-if="med.doses.length > 1"
                  icon="mdi-close-circle-outline"
                  variant="text"
                  color="error"
                  @click="removeDose(med, doseIndex)"
              />
            </div>

            <v-btn
                variant="tonal"
                color="primary"
                prepend-icon="mdi-plus"
                size="small"
                class="rounded-lg text-capitalize font-weight-bold"
                :disabled="med.doses.length >= MAX_DOSES"
                @click="addDose(med)"
            >
              {{ t('reminderDialog.addDose') }}
            </v-btn>
            <div v-if="med.doses.length >= MAX_DOSES" class="text-caption text-error text-center mt-1">
              {{ t('reminderDialog.maxDosesHint', { count: MAX_DOSES }) }}
            </div>
          </div>

          <v-btn
              variant="outlined"
              color="primary"
              prepend-icon="mdi-plus-circle"
              class="rounded-lg text-capitalize font-weight-bold border-dashed"
              @click="addMedication"
          >
            Add Another Medication
          </v-btn>
        </div>
      </v-card-text>

      <v-divider v-if="!$device.isMobile" />

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
import type {Reminder, ReminderGroup} from "~/types/reminder"
import {enUS, fr} from "date-fns/locale"

const {$device} = useNuxtApp()
const {t, locale} = useI18n()

const locales: Record<string, any> = {en: enUS, fr: fr}
const MAX_DOSES = 3

// Props
const {close, updateReminder, validMedications, reminders, item} = defineProps<{
  close: (value: string) => void
  isPersistent: boolean
  scrim: boolean
  updateReminder: (updatePayload: any) => Promise<void>
  validMedications: Medication[]
  reminders: Reminder[]
  item: ReminderGroup
}>()

const isActive = ref(true)
const loading = ref(false)

const form = ref({
  sicknessName: item.sicknessName,
  medications: item.medications.map(med => {
    // Find matching medication object to get the full object (including ID)
    const fullMedObject = validMedications.find(m => m.name === med.name) || { name: med.name } as Medication
    
    return {
      medication: fullMedObject,
      startDate: new Date(item.startDate),
      endDate: new Date(item.endDate),
      doses: [...med.doses.map(d => ({ ...d }))],
      dateMenu: false,
    }
  })
})

const uniqueSicknessNames = computed(() => {
  const names = reminders
      .map((r) => r.sicknessName)
      .filter(Boolean)

  return [...new Set(names)]
});

const isFormInvalid = computed(() => {
  const hasName = !!form.value.sicknessName?.trim()
  const validMeds = form.value.medications.length > 0 && form.value.medications.every(med => {
    const hasMed = !!med.medication
    const validDate = isAfter(med.endDate, med.startDate) || isSameDay(med.endDate, med.startDate)
    const validDoses = med.doses.length > 0 && med.doses.every(d => d.time && d.quantity > 0)
    return hasMed && validDate && validDoses
  })

  return !hasName || !validMeds
})

const addDose = (med: any) => {
  const lastDose = med.doses[med.doses.length - 1]!
  const [hours, minutes] = lastDose.time.split(':').map(Number)

  let newHours = hours! + 4
  if (newHours >= 24) newHours = 23

  const newTime = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  med.doses.push({time: newTime, quantity: 1})
}

const removeDose = (med: any, index: number) => med.doses.splice(index, 1)

const addMedication = () => {
  form.value.medications.push({
    medication: null as unknown as Medication,
    startDate: new Date(item.startDate),
    endDate: new Date(item.endDate),
    doses: [{time: '08:00', quantity: 1}],
    dateMenu: false,
  })
}

const removeMedication = (index: number) => form.value.medications.splice(index, 1)

const handleSave = async () => {
  loading.value = true
  try {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const payload = {
      oldSicknessName: item.sicknessName,
      newSicknessName: form.value.sicknessName,
      remindersToDelete: item.ids,
      medications: form.value.medications.map(med => ({
        name: med.medication.name,
        startDate: med.startDate.toLocaleDateString('en-CA'),
        endDate: med.endDate.toLocaleDateString('en-CA'),
        doses: med.doses.map(d => ({ time: d.time, quantity: d.quantity }))
      })),
      timezone: userTimezone
    }

    await updateReminder(payload)
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

.medication-block {
  background-color: rgb(var(--v-theme-surface-variant), 0.05);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.border-dashed {
  border-style: dashed !important;
}
</style>
