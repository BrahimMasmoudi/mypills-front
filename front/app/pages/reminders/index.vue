<template>
  <v-sheet class="bg-transparent pa-4 h-100 overflow-hidden">
    <div class="mb-4">
      <h1 class="text-h4 font-weight-bold text-primary">{{ t('reminders.title') }}</h1>
      <p class="text-body-1 text-medium-emphasis">{{ t('reminders.subtitle') }}</p>
    </div>

    <v-card border elevation="0" rounded="xl" class="bg-surface overflow-hidden">
      <v-data-table
          :headers="headers"
          :items="groupedReminders"
          :loading="reminderStore.loading"
          hover
          fixed-header
          height="calc(100vh - 200px)"
          hide-default-footer
          :items-per-page="-1"
          class="bg-transparent medication-table"
      >
        <template v-for="header in headers" :key="header.key" #[`header.${header.key}`]="{ column }">
          <span class="text-overline font-weight-black text-medium-emphasis">
            {{ column.title }}
          </span>
        </template>

        <template #loading>
          <v-skeleton-loader type="table-row-divider@6"/>
        </template>

        <template #[`item.sicknessName`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary-lighten-5" size="36" class="mr-3 border">
              <v-icon icon="mdi-medical-bag" color="primary" size="20"/>
            </v-avatar>
            <span class="font-weight-bold text-body-1">{{ item.sicknessName || 'General Treatment' }}</span>
          </div>
        </template>

        <template #[`item.medName`]="{ item }">
          <span class="font-weight-medium">{{ item.medName }}</span>
        </template>

        <template #[`item.dateRange`]="{ item }">
          <v-sheet
              border
              rounded="pill"
              class="px-3 py-1 bg-surface-variant d-flex align-center"
              elevation="0"
              width="fit-content"
          >
            <span class="text-caption font-weight-bold">{{ formatDate(item.startDate) }}</span>
            <v-icon icon="mdi-arrow-right" size="12" class="mx-2 opacity-50"/>
            <span class="text-caption font-weight-bold">{{ formatDate(item.endDate) }}</span>
          </v-sheet>
        </template>

        <template #[`item.doses`]="{ item }">
          <div class="d-flex flex-wrap" style="gap: 8px">
            <v-sheet
                v-for="dose in item.doses"
                :key="dose.time"
                border
                rounded="pill"
                class="px-3 py-1 bg-primary d-flex align-center justify-center"
                elevation="0"
            >
              <v-icon icon="mdi-clock-outline" size="14" color="white" class="mr-2"/>
              <span class="text-caption font-weight-black text-white">{{ dose.time }}</span>
              <v-divider vertical class="mx-2 border-opacity-50" color="white" length="12"/>
              <span class="text-caption font-weight-medium text-white opacity-90">{{ dose.qty }}x</span>
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
              @click="handleDelete(item)"
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
import type {ToastType} from "~/composables/openToast"
import ValidationWithWarningDialog from "~/components/molecules/ValidationWithWarningDialog.vue"

const {t} = useI18n()
const {$open} = useNuxtApp()
const reminderStore = useReminderStore()
const {reminders} = storeToRefs(reminderStore) // Reactivity maintained

const groupedReminders = computed(() => {
  const rawReminders = reminders.value
  if (!rawReminders || rawReminders.length === 0) return []

  const groups = new Map<string, any>()

  rawReminders.forEach((r) => {
    const key = `${r.sicknessName}-${r.medName}`
    if (!groups.has(key)) {
      groups.set(key, {
        sicknessName: r.sicknessName,
        medName: r.medName,
        startDate: r.scheduledTime,
        endDate: r.scheduledTime,
        dosesMap: new Map<string, any>(),
        ids: [],
        status: r.status,
        fullObject: r
      })
    }

    const group = groups.get(key)
    const rDate = new Date(r.scheduledTime)

    if (rDate < group.startDate) group.startDate = rDate
    if (rDate > group.endDate) group.endDate = rDate

    const timeStr = format(rDate, 'HH:mm')
    group.dosesMap.set(timeStr, r.quantity)
    group.ids.push(r.reminderId)
  })

  return Array.from(groups.values()).map(g => ({
    ...g,
    doses: Array.from(g.dosesMap.entries())
        .map(([time, qty]) => ({time, qty}))
        .sort((a, b) => a.time.localeCompare(b.time))
  }))
})


const headers = computed(() => [
  {title: t('reminders.table.sicknessName'), key: 'sicknessName', align: 'start' as const},
  {title: t('reminders.table.medication'), key: 'medName', align: 'start' as const},
  {title: t('reminderDialog.dateRange'), key: 'dateRange', align: 'start' as const},
  {title: t('reminderDialog.frequency'), key: 'doses', align: 'start' as const},
  {title: t('reminders.table.status'), key: 'status', align: 'center' as const},
  {title: '', key: 'actions', align: 'end' as const, sortable: false},
])

const statusConfig = {
  pending: {color: 'warning', icon: 'mdi-timer-sand'},
  sent: {color: 'success', icon: 'mdi-check-circle'},
  failed: {color: 'error', icon: 'mdi-alert-circle'}
}

const formatDate = (date: Date) => date ? format(new Date(date), 'dd MMM') : ''

const handleDelete = async (item: any) => {
  const result = await $open<ToastType>(ValidationWithWarningDialog, {
    scrim: true,
    isPersistent: true,
    title: t('dialogDelete.title'),
    message: t('dialogDelete.message')
  })

  if (result === 'success') {
    await reminderStore.deleteReminder(item.fullObject)
  }
}
</script>

<style scoped>
/* Scoped overrides to ensure headers look elegant */
:deep(.v-data-table-header__content) {
  letter-spacing: 0.1em !important;
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
  transition: background-color 0.2s ease;
}

:deep(.v-data-table__td) {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05) !important;
  padding: 12px 16px !important;
}
</style>