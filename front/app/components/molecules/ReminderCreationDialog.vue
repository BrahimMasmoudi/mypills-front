<template>
  <v-dialog
      v-model="isActive"
      width="550"
      content-class="elevation-0"
      :class="$device.isMobile ? 'align-end ma-0' : ''"
      @keydown.esc="cancelAndClose"
  >
    <v-card class="rounded-xl pa-6" elevation="24">
      <v-sheet
          v-if="$device.isMobile"
          color="grey-lighten-2 mx-auto"
          height="4"
          width="40"
          class="rounded-pill mb-6"
      />
      <div class="d-flex flex-column align-center text-center mb-6">
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

      <v-card-text class="pa-0">
        <div class="d-flex flex-column gap-4">
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

          <div class="d-flex gap-2" :class="$device.isMobile ? 'flex-column' : ''">
            <v-menu v-model="startMenu" :close-on-content-click="false" location="center">
              <template v-slot:activator="{ props }">
                <v-text-field
                    v-bind="props"
                    :model-value="formatDate(form.startDate)"
                    :label="t('reminderDialog.startDate')"
                    variant="outlined"
                    readonly
                    rounded="lg"
                    prepend-inner-icon="mdi-calendar-start"
                    class="font-weight-medium cursor-pointer"
                />
              </template>
              <v-date-picker v-model="form.startDate" @update:model-value="startMenu = false" hide-header rounded="lg"
                             color="primary"/>
            </v-menu>

            <v-menu v-model="endMenu" :close-on-content-click="false" location="center">
              <template v-slot:activator="{ props }">
                <v-text-field
                    v-bind="props"
                    :model-value="formatDate(form.endDate)"
                    :label="t('reminderDialog.endDate')"
                    variant="outlined"
                    readonly
                    rounded="lg"
                    prepend-inner-icon="mdi-calendar-check"
                    class="font-weight-medium cursor-pointer"
                />
              </template>
              <v-date-picker v-model="form.endDate" :min="form.startDate" @update:model-value="endMenu = false"
                             hide-header
                             rounded="lg" color="primary"/>
            </v-menu>
          </div>

          <v-divider/>

          <div class="text-subtitle-2 font-weight-bold my-3">{{ t('reminderDialog.frequency') }}</div>

          <div
              v-for="(item, index) in form.doses"
              :key="index"
              class="d-flex align-center mb-3"
          >
            <v-text-field
                v-model="item.time"
                type="time"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                hide-details
                :min="index > 0 ? form?.doses[index - 1]?.time : undefined"
                class="font-weight-medium flex-grow-1 mr-4"
            />

            <v-text-field
                v-model.number="item.quantity"
                type="number"
                :label="t('reminderDialog.quantity')"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                hide-details
                min="0.5"
                step="0.5"
                style="width: 100px;"
                class="font-weight-medium flex-grow-0 flex-shrink-0"
            />

            <v-btn
                v-if="index !== 0"
                icon="mdi-close-circle-outline"
                variant="text"
                color="error"
                class="flex-grow-0 flex-shrink-0"
                @click="removeDose(index)"
            />
          </div>

          <v-btn
              variant="tonal"
              color="primary"
              prepend-icon="mdi-plus"
              class="rounded-lg text-capitalize font-weight-bold"
              @click="addDose"
          >
            {{ t('reminderDialog.addDose') }}
          </v-btn>
        </div>
      </v-card-text>

      <v-card-actions class="w-100 justify-center pt-8 gap-3 px-0">
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
import {useI18n} from "vue-i18n";
import {isSameDay, isAfter, format} from "date-fns";
import type {Medication} from "~/types/medication";
import type {CreateReminderRequest} from "~/types/reminder";
import {enUS, fr} from "date-fns/locale";

const {$device} = useNuxtApp();
const {t, locale} = useI18n()

const locales: Record<string, any> = {en: enUS, fr: fr};

const isActive = ref(true);
const loading = ref(false);
const startMenu = ref(false);
const endMenu = ref(false);

const {close, createReminder, validMedications} = defineProps<{
  close: (value: ToastType) => void
  isPersistent: boolean
  scrim: boolean
  createReminder: (createReminderRequest: CreateReminderRequest) => Promise<void>
  validMedications: Medication[]
}>()

const formatDate = (date: Date | string) => {
  if (!date) return '';
  return format(new Date(date), 'dd MMMM yyyy', {locale: locales[locale.value] || enUS});
}

const form = ref({
  medication: null as unknown as Medication,
  startDate: new Date(),
  endDate: new Date(),
  doses: [
    {time: '08:00', quantity: 1}
  ]
})

const isFormInvalid = computed(() => {
  const hasMed = !!form.value.medication;
  const validDate =
      isAfter(form.value.endDate, form.value.startDate) ||
      isSameDay(form.value.endDate, form.value.startDate);
  const validDoses =
      form.value.doses.length > 0 &&
      form.value.doses.every(d => d.time && d.quantity > 0);

  return !hasMed || !validDate || !validDoses;
});

const addDose = () => {
  const lastDose = form.value.doses[form.value.doses.length - 1]!
  const [hours, minutes] = lastDose.time.split(':').map(Number)

  let newHours = hours! + 4
  if (newHours >= 24) newHours = 23

  const newTime = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

  form.value.doses.push({time: newTime, quantity: 1})
}

const removeDose = (index: number) => form.value.doses.splice(index, 1);

const handleSave = async () => {
  loading.value = true
  try {
    const payload = {
      ...form.value,
      startDate: form.value.startDate.toLocaleDateString('en-CA'),
      endDate: form.value.endDate.toLocaleDateString('en-CA'),
    };

    await createReminder(payload as unknown as CreateReminderRequest)
    close('success')
  } catch (e) {
    console.error(e)
    close('error')
  } finally {
    loading.value = false
  }
}

watch(() => form.value.doses, (newDoses) => {
  newDoses.forEach((dose, index) => {
    if (index === 0) return

    const prevTime = newDoses[index - 1]?.time

    if (prevTime && dose.time <= prevTime) {
      const [hours, mins] = prevTime.split(':').map(Number)

      let nextH = hours
      let nextM = mins + 1

      if (nextM >= 60) {
        nextM = 0
        nextH = Math.min(nextH + 1, 23)
      }

      dose.time = `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`
    }
  });
}, {deep: true});

const cancelAndClose = () => close('canceled')
</script>