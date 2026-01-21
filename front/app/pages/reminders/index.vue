<template>
  <v-sheet height="calc(100vh - 64px)" class=" mb-2 overflow-hidden pa-4">
    <v-card border elevation="0" rounded="xl" class="bg-surface overflow-hidden">
      <v-data-table
          :headers="headers"
          :items="reminders"
          :loading="pending"
          hover
          class="elevation-2 rounded-lg"
          fixed-header
          height="100vh"
          hide-default-footer
          :items-per-page="-1">
        <template #loading>
          <v-skeleton-loader type="table-row-divider@6"/>
        </template>

        <template #[`item.sicknessName`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary-lighten-5" size="36" class="mr-3 border">
              <v-icon icon="mdi-medical-bag" color="primary" size="20"/>
            </v-avatar>
            <div>
              <div class="font-weight-bold text-body-1">{{ item.sicknessName || 'General Treatment' }}</div>
            </div>
          </div>
        </template>

        <template #[`item.medName`]="{ item }">
          <span class="font-weight-medium">{{ item.medName }}</span>
        </template>

        <template #[`item.scheduledTime`]="{ item }">
          <div class="d-flex align-center">
            <v-sheet
                border
                rounded="pill"
                class="px-3 py-1 bg-primary d-flex align-center"
                elevation="0"
            >
              <v-icon icon="mdi-clock-outline" size="14" color="white" class="mr-2"/>
              <span class="text-body-2 font-weight-black mr-2">{{ formatTime(item.scheduledTime) }}</span>
              <v-divider vertical class="mx-1" length="12"/>
              <span class="text-caption font-weight-medium ml-2 opacity-70">{{ formatDate(item.scheduledTime) }}</span>
            </v-sheet>
          </div>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip
              :color="statusConfig[item.status].color"
              :prepend-icon="statusConfig[item.status].icon"
              size="x-small"
              class="text-uppercase font-weight-black px-3"
              variant="flat"
          >
            {{ t(`status.${item.status}`) }}
          </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <v-btn
              icon="mdi-delete-outline"
              variant="tonal"
              color="error"
              size="small"
              @click="deleteReminder(item.reminderId)"
          />
        </template>
      </v-data-table>
    </v-card>
  </v-sheet>
</template>
<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import {format} from 'date-fns'
import {useReminderStore} from '~/store/reminder'
import type {ToastType} from "~/composables/openToast";
import ValidationWithWarningDialog from "~/components/molecules/ValidationWithWarningDialog.vue";

const {t} = useI18n()
const {$open} = useNuxtApp()
const reminderStore = useReminderStore()

const {data: reminders, pending, refresh} = await useLazyAsyncData(
    'reminders-list',
    () => reminderStore.fetchUserReminders(),
    {
      default: () => [],
      transform: (data: any[]) => data.sort((a, b) => b.scheduledTime - a.scheduledTime)
    }
)

const headers = computed(() => ([
  {title: t('reminders.table.sicknessName'), key: 'sicknessName', align: 'start' as const},
  {title: t('reminders.table.medication'), key: 'medName', align: 'start' as const},
  {title: t('reminders.table.quantity'), key: 'quantity', align: 'center' as const},
  {title: t('reminders.table.time'), key: 'scheduledTime', align: 'start' as const},
  {title: t('reminders.table.status'), key: 'status', align: 'center' as const},
  {title: '', key: 'actions', align: 'end' as const, sortable: false},
]))

const statusConfig = {
  pending: {color: 'warning', icon: 'mdi-timer-sand'},
  sent: {color: 'success', icon: 'mdi-check-circle'},
  failed: {color: 'error', icon: 'mdi-alert-circle'}
}

// Formatters
const formatTime = (date: Date) => date ? format(new Date(date), 'HH:mm') : '--:--'
const formatDate = (date: Date) => date ? format(new Date(date), 'dd MMM') : ''

const deleteReminder = async (id: string) => {
  const result = await $open<ToastType>(ValidationWithWarningDialog, {
    scrim: true,
    isPersistent: true,
    title: t('dialogDelete.title'),
    message: t('dialogDelete.message')
  })

  if (result === 'success') {
    await reminderStore.deleteById(id)
    refresh()
  }
}
</script>

<style scoped>
/* Table Hover Effect */
:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
  transition: background-color 0.2s ease;
}

:deep(.v-data-table__td) {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05) !important;
  padding: 12px 16px !important;
}
</style>