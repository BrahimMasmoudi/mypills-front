<template>
  <v-sheet v-if="isLoading" width="100%" height="100%">
    <MoleculesReminderSkeletonLoader />
  </v-sheet>

  <v-sheet v-else width="100%" height="calc(100vh - 64px)" class="d-flex flex-column align-start mb-2 overflow-hidden pa-4">

    <div class="w-100 flex-shrink-0">
      <v-sheet class="d-flex align-center justify-space-between mb-4">
        <div>
          <h1 class="text-h4 font-weight-bold text-primary mb-2">{{ t('reminders.title') }}</h1>
          <p class="text-body-1 text-medium-emphasis">{{ t('reminders.subtitle') }}</p>
        </div>

        <v-btn-toggle
            v-if="!$device.isMobile"
            v-model="viewType"
            mandatory
            color="primary"
            variant="outlined"
            density="comfortable"
            rounded="pill"
        >
          <v-btn value="grid" icon="mdi-view-grid-outline"/>
          <v-btn value="table" icon="mdi-view-list"/>
        </v-btn-toggle>
      </v-sheet>
    </div>

    <v-sheet v-if="groupedReminders.length === 0"
             class="w-100 flex-grow-1 d-flex flex-column align-center justify-center">
      <v-icon icon="mdi-calendar-blank" size="64" color="medium-emphasis" class="mb-4"/>
      <p class="text-h6 text-medium-emphasis">{{ t('reminders.empty') }}</p>
    </v-sheet>

    <div v-else class="w-100 flex-grow-1 overflow-y-auto">
      <v-row v-if="$device.isMobile || viewType === 'grid'" class="d-flex align-stretch justify-start mt-0 px-1">
        <v-col
            v-for="reminder in groupedReminders"
            :key="reminder.sicknessName"
            cols="12" sm="6" md="3"
        >
          <MoleculesReminderCard
              :item="reminder"
              :status-config="statusConfig"
              @delete="handleDelete"
              @update-status="handleUpdateStatus"
          />
        </v-col>
      </v-row>

      <MoleculesReminderDataTable
          v-else-if="viewType === 'table'"
          :items="groupedReminders"
          :loading="isLoading"
          :headers="headers"
          :status-config="statusConfig"
          @delete="handleDelete"
          @update-status="handleUpdateStatus"
      />
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import {storeToRefs} from 'pinia'
import {logEvent} from "firebase/analytics";
import {format} from 'date-fns'
import type {ReminderGroup} from '~/types/reminder'
import type {ToastType} from "~/composables/openToast"
import ValidationWithWarningDialog from "~/components/molecules/ValidationWithWarningDialog.vue"
import {useI18n} from "vue-i18n";
import {useReminderStore} from "~/store/reminder";

const {t} = useI18n()
const {$open, $device, $analytics} = useNuxtApp()
const reminderStore = useReminderStore()
const {reminders, isLoading} = storeToRefs(reminderStore)
const searchQuery = ref('')
const viewType = ref<'grid' | 'table'>('grid')

useSeoMeta({
  title: () => t('nav.reminders')
})

const groupedReminders = computed((): ReminderGroup[] => {
  const rawReminders = reminders.value
  if (!rawReminders?.length) return []

  const groups = new Map<string, any>()

  rawReminders.forEach((r) => {
    const key = r.sicknessName || 'General'
    if (!groups.has(key)) {
      groups.set(key, {
        sicknessName: key,
        startDate: new Date(r.scheduledTime),
        endDate: new Date(r.scheduledTime),
        medsMap: new Map<string, Map<string, string | number>>(),
        ids: [],
        status: r.status,
        fullObject: r
      })
    }

    const group = groups.get(key)!
    const rDate = new Date(r.scheduledTime)

    if (rDate < group.startDate) group.startDate = rDate
    if (rDate > group.endDate) group.endDate = rDate

    if (!group.medsMap.has(r.medName)) {
      group.medsMap.set(r.medName, new Map<string, string | number>())
    }

    const timeStr = format(rDate, 'HH:mm')
    group.medsMap.get(r.medName).set(timeStr, r.quantity)
    group.ids.push(r.reminderId)

    if (r.status === 'failed') group.status = 'failed'
    else if (group.status !== 'failed' && r.status === 'pending') group.status = 'pending'
  })

  return Array.from(groups.values()).map((g) => {
    const medsEntries = Array.from(g.medsMap.entries()) as [string, Map<string, string | number>][]

    const medications = medsEntries.map(([name, dosesMap]) => ({
      name,
      doses: Array.from(dosesMap.entries())
          .map(([time, quantity]) => ({time, quantity}))
          .sort((a, b) => a.time.localeCompare(b.time))
    }))

    return {
      sicknessName: g.sicknessName,
      medNames: medications.map(m => m.name),
      medications: medications,
      startDate: g.startDate,
      endDate: g.endDate,
      ids: g.ids,
      status: g.status,
      fullObject: g.fullObject,
      doses: medications.flatMap(m => m.doses)
    } as unknown as ReminderGroup
  })
})

const statusConfig = {
  pending: {color: 'warning', icon: 'mdi-timer-sand'},
  sent: {color: 'success', icon: 'mdi-check-circle'},
  failed: {color: 'error', icon: 'mdi-alert-circle'}
}

const headers = computed(() => [
  {title: t('reminders.table.sicknessName'), key: 'sicknessName', align: 'start' as const},
  {title: t('reminders.table.medication'), key: 'medName', align: 'start' as const},
  {title: t('reminderDialog.dateRange'), key: 'dateRange', align: 'start' as const},
  {title: t('reminderDialog.frequency'), key: 'doses', align: 'start' as const},
  {title: t('reminders.table.status'), key: 'status', align: 'center' as const},
  {title: '', key: 'actions', align: 'end' as const, sortable: false},
])

const handleUpdateStatus = async (ids: string[], status: 'sent' | 'failed', done: () => void) => {
  try {
    await reminderStore.updateRemindersStatus(ids, status)
  } finally {
    done()
  }
}

const handleDelete = async (item: ReminderGroup, done: () => void) => {
  const result = await $open<ToastType>(ValidationWithWarningDialog, {
    scrim: true,
    isPersistent: true,
    title: t('reminders.dialogDelete.title'),
    message: t('reminders.dialogDelete.message')
  })

  if (result === 'success') {
    try {
      await reminderStore.deleteReminders(item)
    } finally {
      done()
    }
  } else {
    done()
  }
}
</script>