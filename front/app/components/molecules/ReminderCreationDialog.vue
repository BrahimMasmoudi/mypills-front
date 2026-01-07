<template>
  <v-dialog
      v-model="isActive"
      width="550"
      content-class="elevation-0"
      @keydown.esc="cancelAndClose"
  >
    <v-card class="rounded-xl pa-6" elevation="24">
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
              v-model="form.name"
              :items="validMedications"
              :label="t('dialogCreate.medicationLabel')"
              variant="outlined"
              rounded="lg"
              item-title="name"
              item-value="id"
              prepend-inner-icon="mdi-pill"
              class="font-weight-medium"
          />

          <div class="d-flex gap-2" :class="$device.isMobile ? 'flex-column' : ''">
            <v-menu v-model="startMenu" :close-on-content-click="false" location="center">
              <template v-slot:activator="{ props }">
                <v-text-field
                    v-bind="props"
                    :model-value="formatDisplayDate(form.startDate)"
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
                    :model-value="formatDisplayDate(form.endDate)"
                    :label="t('reminderDialog.endDate')"
                    variant="outlined"
                    readonly
                    rounded="lg"
                    prepend-inner-icon="mdi-calendar-check"
                    class="font-weight-medium cursor-pointer"
                />
              </template>
              <v-date-picker v-model="form.endDate" :min="form.startDate" @update:model-value="endMenu = false" hide-header
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
        <v-btn color="primary" variant="flat" size="large" class="flex-grow-1 text-capitalize font-weight-bold"
               height="48" :loading="loading" @click="handleSave">
          {{ t('confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {format, addDays} from "date-fns";
import type {Medication} from "~/types/medication";

const {t} = useI18n();
const {$device} = useNuxtApp();

const isActive = ref(true);
const loading = ref(false);
const startMenu = ref(false);
const endMenu = ref(false);

const formatDisplayDate = (date: Date) => format(date, 'PPP');

const {close, createReminder, validMedications} = defineProps<{
  close: (value: ToastType) => void
  isPersistent: boolean
  scrim: boolean
  createReminder: (createReminderRequest : any) => Promise<void>
  validMedications: Medication[]
}>()

const form = ref({
  medication : undefined,
  startDate: new Date(),
  endDate: addDays(new Date(), 7),
  doses: [
    {time: '08:00', quantity: 1}
  ]
})

const addDose = () => form.value.doses.push({time: '12:00', quantity: 1});
const removeDose = (index: number) => form.value.doses.splice(index, 1);

const handleSave = async () => {
  loading.value = true
  try {
    console.log(form.value)
    await createReminder({})
    close('success')
  } catch (e) {
    console.error(e)
    close('error')
  } finally {
    loading.value = false
  }
};

const cancelAndClose = () => close('canceled')
</script>