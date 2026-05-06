<template>
  <v-dialog v-model="isActive" width="550" content-class="elevation-0" :class="$device.isMobile ? 'align-end ma-0' : ''"
    @keydown.esc="cancelAndClose">
    <v-card class="reminder-card rounded-xl pa-0 d-flex flex-column overflow-hidden" elevation="24"
      :max-height="$device.isMobile ? '90vh' : '85vh'">
      <!-- Premium Background Decor -->
      <div class="glass-mesh-bg" />

      <!-- Custom Stepper Header -->
      <div class="pa-6 pb-0 flex-shrink-0 relative-z">
        <v-sheet v-if="$device.isMobile" color="grey-lighten-2 mx-auto" height="4" width="40"
          class="rounded-pill mb-6 opacity-50" />

        <div class="d-flex flex-column align-center text-center mb-6">
          <v-avatar class="step-avatar mb-3" :color="currentStepColor" size="64">
            <v-icon :icon="currentStepIcon" color="white" size="32" />
          </v-avatar>
          <div class="text-overline font-weight-black text-primary mb-1 ls-3">
            STEP {{ step }} OF 3
          </div>
          <v-card-title class="text-h5 font-weight-bold pt-0 heading-font">
            {{ currentStepTitle }}
          </v-card-title>
          <div class="text-body-2 text-medium-emphasis px-8">
            {{ currentStepSubtitle }}
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-container mx-8 mb-6">
          <div class="progress-bar" :style="{ width: `${(step / 3) * 100}%` }" />
        </div>
      </div>

      <!-- Scrollable Step Content -->
      <v-card-text class="pa-6 pt-0 overflow-y-auto flex-grow-1 relative-z scroll-custom">
        <v-window v-model="step" touchless>
          <!-- Step 1: Medication -->
          <v-window-item :value="1">
            <div class="d-flex flex-column pt-2">
              <v-combobox v-model="form.sicknessName" :items="uniqueSicknessNames"
                :label="t('reminderDialog.sicknessNameLabel')" variant="outlined" hide-details="auto" rounded="lg"
                color="primary" class="premium-input mb-4" :return-object="false" />
              <v-select v-model="form.medication" :items="validMedications" :label="t('dialogCreate.medicationLabel')"
                variant="outlined" rounded="lg" color="primary" item-title="name" item-value="id" return-object
                prepend-inner-icon="mdi-pill" class="premium-input">
                <template #item="{ props, item }">
                  <v-list-item v-bind="props" :subtitle="`${item.raw.quantity} pills available`" />
                </template>
              </v-select>
            </div>
          </v-window-item>

          <!-- Step 2: Duration -->
          <v-window-item :value="2">
            <div class="d-flex flex-column pt-2">
              <v-card variant="flat" :color="isLongTerm ? 'primary' : 'grey-lighten-4'"
                class="mb-6 rounded-xl w-full border-premium transition-all cursor-pointer mode-card"
                :class="{ 'active-mode': isLongTerm }" @click="isLongTerm = !isLongTerm">
                <div class="pa-5 d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-avatar :color="isLongTerm ? 'white' : 'grey-darken-1'" size="48" class="mr-4 elevation-2">
                      <v-icon :icon="isLongTerm ? 'mdi-infinity' : 'mdi-calendar-check'"
                        :color="isLongTerm ? 'primary' : 'white'" size="28" />
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-1 font-weight-bold" :class="isLongTerm ? 'text-white' : ''">
                        {{ t('reminderDialog.longTermLabel') }}
                      </div>
                      <div class="text-caption" :class="isLongTerm ? 'text-white opacity-80' : 'text-medium-emphasis'">
                        {{ isLongTerm ? t('reminderDialog.longTermDesc') : t('reminderDialog.standardTermDesc') }}
                      </div>
                    </div>
                  </div>
                  <v-checkbox-btn v-model="isLongTerm" :color="isLongTerm ? 'white' : 'primary'" hide-details
                    class="ma-0" @click.stop />
                </div>
              </v-card>

              <MoleculesReminderDatePicker v-model:start-date="form.startDate" v-model:end-date="form.endDate"
                :max-days="maxDays" class="premium-date-picker" />
            </div>
          </v-window-item>

          <!-- Step 3: Schedule -->
          <v-window-item :value="3">
            <div class="d-flex flex-column pt-2">
              <!-- Inventory Warning Banner -->
              <v-alert v-if="totalPillsNeeded > (form.medication?.quantity || 0)" type="warning" variant="tonal"
                class="mb-6 rounded-xl border-warning" density="comfortable">
                <template #prepend>
                  <v-icon icon="mdi-alert-circle-outline" size="24" />
                </template>
                <div class="text-subtitle-2 font-weight-bold">
                  {{ t('reminderDialog.insufficientStockShort') }}
                </div>
                <div class="text-caption">
                  {{ t('reminderDialog.inventoryWarningMessage', {
                    needed: totalPillsNeeded,
                    available: form.medication?.quantity || 0
                  }) }}
                </div>
              </v-alert>

              <!-- Desktop Layout: Clean & Linear -->
              <template v-if="!$device.isMobile">
                <div v-for="(item, index) in form.doses" :key="index"
                  class="dose-row d-flex align-center mb-4 pa-4 rounded-xl border-premium bg-white-glass transition-all">
                  <v-avatar color="primary-lighten-5" size="40" class="mr-4 font-weight-black text-primary">
                    {{ index + 1 }}
                  </v-avatar>

                  <MoleculesTimePicker v-model="item.time" class="mr-4 flex-grow-1" />

                  <div class="quantity-control d-flex align-center px-2 py-1 rounded-pill bg-grey-lighten-4">
                    <v-btn icon="mdi-minus" variant="text" size="x-small"
                      @click="item.quantity = Math.max(1, item.quantity - 1)" />
                    <div class="mx-3 font-weight-bold" style="min-width: 20px; text-align: center">{{ item.quantity }}
                    </div>
                    <v-btn icon="mdi-plus" variant="text" size="x-small" @click="item.quantity++" />
                  </div>

                  <v-btn v-if="index !== 0" icon="mdi-delete-outline" variant="text" color="error" class="ml-2"
                    @click="removeDose(index)" />
                </div>
              </template>

              <!-- Mobile Layout: Ergonomic & Dynamic -->
              <template v-else>
                <div v-for="(item, index) in form.doses" :key="index"
                  class="mobile-dose-row d-flex align-center mb-4 pa-3 rounded-2xl border-premium bg-white-glass shadow-sm transition-all overflow-hidden">

                  <div class="mobile-index-badge d-flex align-center justify-center mr-3 flex-shrink-0">
                    <div :style="{ borderColor: `rgb(var(--v-theme-primary))` }" />
                    <span class="text-caption font-weight-black text-primary relative-z">{{ index + 1 }}</span>
                  </div>

                  <div class="flex-grow-1 mr-2" style="min-width: 0;">
                    <MoleculesTimePicker v-model="item.time" class="compact-time-picker" />
                  </div>

                  <div
                    class="mobile-qty-control d-flex align-center rounded-pill bg-primary-lighten-5 px-1 py-1 flex-shrink-0">
                    <v-btn icon="mdi-minus" variant="text" size="x-small" density="comfortable" color="primary"
                      @click="item.quantity = Math.max(1, item.quantity - 1)" />
                    <div class="mx-1 font-weight-black text-primary text-center"
                      style="min-width: 18px; font-size: 13px;">{{ item.quantity }}</div>
                    <v-btn icon="mdi-plus" variant="text" size="x-small" density="comfortable" color="primary"
                      @click="item.quantity++" />
                  </div>

                  <v-btn v-if="index !== 0" icon="mdi-close" variant="text" color="error" size="small"
                    class="ml-2 flex-shrink-0" @click="removeDose(index)" />
                </div>
              </template>

              <v-btn variant="flat" color="primary-lighten-5" prepend-icon="mdi-plus-circle"
                class="rounded-xl text-capitalize font-weight-bold text-primary py-6 mb-4" block
                :disabled="form.doses.length >= MAX_DOSES" @click="addDose">
                {{ t('reminderDialog.addDose') }}
              </v-btn>

              <div v-if="form.doses.length >= MAX_DOSES" class="text-caption text-error text-center mb-4">
                {{ t('reminderDialog.maxDosesHint', { count: MAX_DOSES }) }}
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider v-if="!$device.isMobile" class="opacity-10" />

      <!-- Dynamic Footer -->
      <v-card-actions class="w-100 justify-center pa-6 gap-3 flex-shrink-0 relative-z bg-footer-glass">
        <v-btn v-if="step === 1" variant="outlined" size="large" color="grey-darken-1"
          class="flex-grow-1 rounded-xl text-capitalize font-weight-bold border-opacity-25" height="54"
          @click="cancelAndClose">
          {{ t('cancel') }}
        </v-btn>
        <v-btn v-else variant="tonal" size="large" color="primary"
          class="flex-grow-1 rounded-xl text-capitalize font-weight-bold" height="54" prepend-icon="mdi-arrow-left"
          @click="step--">
          {{ t('back') }}
        </v-btn>

        <v-btn v-if="step < 3" :disabled="isCurrentStepInvalid" color="primary" variant="flat" size="large"
          class="flex-grow-1 rounded-xl text-capitalize font-weight-bold elevation-4 shadow-primary" height="54"
          append-icon="mdi-arrow-right" @click="step++">
          {{ t('next') }}
        </v-btn>
        <v-btn v-else :disabled="isFormInvalid" color="primary" variant="flat" size="large"
          class="flex-grow-1 rounded-xl text-capitalize font-weight-bold elevation-8 shadow-primary" height="54"
          :loading="loading" @click="handleSave">
          {{ t('confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { isSameDay, isAfter, differenceInDays } from 'date-fns'
import type { Medication } from '~/types/medication'
import type { CreateReminderRequest, Reminder } from '~/types/reminder'
import { enUS, fr } from 'date-fns/locale'
import ValidationPrimaryDialog from '~/components/molecules/ValidationPrimaryDialog.vue'
import type { ToastType } from '~/composables/openToast'

const { $device } = useNuxtApp()
const { t, locale } = useI18n()

const MAX_DOSES = 3
const step = ref(1)

// Props
const { close, createReminder, validMedications, reminders } = defineProps<{
  close: (value: string) => void
  isPersistent: boolean
  scrim: boolean
  createReminder: (createReminderRequest: CreateReminderRequest) => Promise<void>
  validMedications: Medication[]
  reminders: Reminder[]
}>()

const { $open } = useNuxtApp()
const isActive = ref(true)
const loading = ref(false)
const isLongTerm = ref(false)

const form = ref({
  sicknessName: null as any,
  medication: null as unknown as Medication,
  startDate: new Date(),
  endDate: new Date(),
  doses: [
    { time: '08:00', quantity: 1 }
  ]
})

// Step Helpers
const currentStepTitle = computed(() => {
  if (step.value === 1) return t('reminderDialog.step1Title', 'Treatment Info')
  if (step.value === 2) return t('reminderDialog.step2Title', 'Duration & Mode')
  return t('reminderDialog.step3Title', 'Scheduling')
})

const currentStepSubtitle = computed(() => {
  if (step.value === 1) return t('reminderDialog.step1Subtitle', 'What are we treating today?')
  if (step.value === 2) return t('reminderDialog.step2Subtitle', 'Define how long this treatment will last.')
  return t('reminderDialog.step3Subtitle', 'Set your daily dose frequency.')
})

const currentStepIcon = computed(() => {
  if (step.value === 1) return 'mdi-pill'
  if (step.value === 2) return 'mdi-calendar-range'
  return 'mdi-clock-check-outline'
})

const currentStepColor = computed(() => {
  if (step.value === 1) return 'primary'
  if (step.value === 2) return 'indigo'
  return 'teal'
})

const maxDays = computed(() => isLongTerm.value ? 90 : 15)

const totalPillsNeeded = computed(() => {
  if (!form.value.startDate || !form.value.endDate || !form.value.doses.length) return 0
  const days = differenceInDays(form.value.endDate, form.value.startDate) + 1
  const pillsPerDay = form.value.doses.reduce((acc, dose) => acc + (Number(dose.quantity) || 0), 0)
  return days * pillsPerDay
})

const uniqueSicknessNames = computed(() => {
  const names = reminders.map((r) => r.sicknessName).filter(Boolean)
  return [...new Set(names)]
});

const isCurrentStepInvalid = computed(() => {
  if (step.value === 1) return !form.value.sicknessName?.trim() || !form.value.medication
  if (step.value === 2) {
    return !isAfter(form.value.endDate, form.value.startDate) && !isSameDay(form.value.endDate, form.value.startDate)
  }
  return false
})

const isFormInvalid = computed(() => {
  const hasName = !!form.value.sicknessName?.trim()
  const hasMed = !!form.value.medication
  const validDate = isAfter(form.value.endDate, form.value.startDate) || isSameDay(form.value.endDate, form.value.startDate)
  const validDoses = form.value.doses.length > 0 && form.value.doses.every(d => d.time && d.quantity > 0)
  return !hasMed || !validDate || !validDoses || !hasName
})

const addDose = () => {
  const lastDose = form.value.doses[form.value.doses.length - 1]!
  const [hours, minutes] = lastDose.time.split(':').map(Number)
  let newHours = hours! + 4
  if (newHours >= 24) newHours = 23
  const newTime = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  form.value.doses.push({ time: newTime, quantity: 1 })
}

const removeDose = (index: number) => form.value.doses.splice(index, 1)

const handleSave = async () => {
  if (totalPillsNeeded.value > (form.value.medication?.quantity || 0)) {
    const confirm = await $open<ToastType>(ValidationPrimaryDialog, {
      scrim: true,
      isPersistent: true,
      title: t('reminderDialog.inventoryWarningTitle'),
      message: t('reminderDialog.inventoryWarningMessage', {
        needed: totalPillsNeeded.value,
        available: form.value.medication?.quantity || 0
      })
    })
    if (confirm !== 'success') return
  }

  loading.value = true
  try {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const payload = {
      ...form.value,
      medicationId: form.value.medication.medicationId,
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

<style scoped lang="scss">
.reminder-card {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px);
  position: relative;
}

.glass-mesh-bg {
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  z-index: 0;
  pointer-events: none;
}

.relative-z {
  position: relative;
  z-index: 1;
}

.heading-font {
  font-family: 'Outfit', 'Inter', sans-serif !important;
  letter-spacing: -0.5px;
}

.ls-3 {
  letter-spacing: 3px !important;
}

.progress-container {
  height: 6px;
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 10px;
  overflow: hidden;

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, rgb(var(--v-theme-primary)) 0%, #6366f1 100%);
    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    border-radius: 10px;
  }
}

.premium-input {
  :deep(.v-field) {
    border-radius: 16px !important;

    &.v-field--focused {
      background-color: white !important;
    }
  }
}

.border-premium {
  border: 1px solid rgba(var(--v-theme-primary), 0.1) !important;
}

.border-warning {
  border: 1px solid rgba(var(--v-theme-warning), 0.3) !important;
}

.mode-card {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1) !important;
  }

  &.active-mode {
    box-shadow: 0 20px 40px -15px rgba(var(--v-theme-primary), 0.3) !important;
  }
}

.bg-white-glass {
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(10px);
}

.dose-row {
  transition: all 0.3s ease;

  &:hover {
    border-color: rgb(var(--v-theme-primary)) !important;
    background: white !important;
  }
}

.bg-footer-glass {
  background: rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(10px);
}

.mobile-dose-row {
  position: relative;
  border: 1px solid rgba(var(--v-theme-primary), 0.08);

  &:active {
    transform: scale(0.98);
    background: white !important;
  }
}

.mobile-index-badge {
  width: 28px;
  height: 28px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 10px;
  position: relative;
}

.compact-time-picker {
  :deep(.v-field) {
    border-radius: 12px !important;
    padding-inline-start: 8px !important;

    .v-field__prepend-inner {
      padding-top: 0 !important;
      margin-inline-end: 4px !important;

      .v-icon {
        font-size: 18px !important;
      }
    }

    input {
      font-size: 14px !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      min-height: 40px !important;
    }
  }
}

.shadow-primary {
  box-shadow: 0 10px 20px -10px rgba(var(--v-theme-primary), 0.5) !important;
}

.scroll-custom {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--v-theme-primary), 0.1);
    border-radius: 10px;
  }
}

.step-avatar {
  transition: all 0.5s ease;
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
}

.transition-all {
  transition: all 0.3s ease;
}

.v-selection-control {
  flex: none;
}
</style>