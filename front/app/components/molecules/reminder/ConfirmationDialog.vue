<template>
  <v-dialog
    v-model="isActive"
    width="450"
    content-class="elevation-0"
    :class="$device.isMobile ? 'align-end ma-0' : ''"
    @keydown.esc="close('canceled')"
  >
    <v-card class="rounded-xl pa-0 d-flex flex-column" elevation="24">
      <div class="pa-6 pb-0 flex-shrink-0">
        <v-sheet
          v-if="$device.isMobile"
          color="grey-lighten-2 mx-auto"
          height="4"
          width="40"
          class="rounded-pill mb-6"
        />

        <div class="d-flex flex-column align-center text-center">
          <v-avatar color="primary-lighten-5" size="64" class="mb-4">
            <v-icon icon="mdi-pill-multiple" color="primary" size="46"/>
          </v-avatar>
          <v-card-title class="text-h5 font-weight-bold pt-0">
            {{ t('reminderConfirmation.title') }}
          </v-card-title>
          <div class="text-body-1 text-medium-emphasis mt-2">
            {{ t('reminderConfirmation.message', { medName: item.medName, quantity: item.quantity }) }}
          </div>
        </div>
      </div>

      <v-card-actions class="d-flex flex-column pa-6 gap-3">
        <v-btn
          block
          color="primary"
          variant="flat"
          size="large"
          height="54"
          class="rounded-lg text-capitalize font-weight-bold text-h6"
          prepend-icon="mdi-check-circle"
          @click="close('taken')"
        >
          {{ t('reminderConfirmation.taken') }}
        </v-btn>

        <div class="d-flex w-100 gap-3">
          <v-btn
            variant="outlined"
            size="large"
            color="primary"
            class="flex-grow-1 text-capitalize font-weight-bold"
            height="48"
            prepend-icon="mdi-timer-sand"
            @click="close('postpone-1h')"
          >
            {{ t('reminderConfirmation.postpone1h') }}
          </v-btn>
          <v-btn
            variant="outlined"
            size="large"
            color="grey-darken-1"
            class="flex-grow-1 text-capitalize font-weight-bold"
            height="48"
            prepend-icon="mdi-calendar-edit"
            @click="close('postpone-later')"
          >
            {{ t('reminderConfirmation.postponeLater') }}
          </v-btn>
        </div>

        <v-btn
          block
          variant="text"
          color="grey"
          class="mt-2 text-capitalize"
          @click="close('canceled')"
        >
          {{ t('cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Reminder } from '~/types/reminder'

const { t } = useI18n()
const { $device } = useNuxtApp()

const { close, item } = defineProps<{
  close: (value: string) => void
  item: Reminder
}>()

const isActive = ref(true)
</script>

<style scoped>
.gap-3 {
  gap: 12px
}
</style>
