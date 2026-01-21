<template>
  <v-sheet class="pa-4 h-100 overflow-hidden">

    <v-sheet class="d-flex align-center justify-space-between">
      <div class="mb-6">
        <h1 class="text-h4 font-weight-bold text-primary">{{ t('reminders.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis">{{ t('reminders.subtitle') }}</p>
      </div>

      <v-btn-toggle
          v-if="$device.isDesktop"
          v-model="viewType"
          @update:model-value="handleViewTypeUpdate"
          mandatory
          color="primary"
          variant="outlined"
          density="comfortable"
          rounded="pill"
          class="ml-4 view-toggle"
      >
        <v-btn value="grid" icon="mdi-view-grid-outline"/>
        <v-btn value="table" icon="mdi-view-list"/>
      </v-btn-toggle>
    </v-sheet>



    <div v-if="!reminderStore.loading && groupedReminders.length === 0"
         class="d-flex flex-column align-center justify-center py-12">
      <v-icon icon="mdi-calendar-blank" size="64" color="medium-emphasis" class="mb-4"/>
      <p class="text-h6 text-medium-emphasis">{{ t('reminders.empty') }}</p>
    </div>

    <div v-else>
      <template v-if="$device.isMobile || viewType === 'grid'">
        <v-row class="d-flex align-stretch justify-start mt-0 px-1">
          <v-col
              md="3"
              cols="12"
              v-for="reminder in groupedReminders"
          >
            <MoleculesReminderCard
                :item="reminder"
                :status-config="statusConfig"
                @delete="handleDelete"
            />
          </v-col>
        </v-row>

      </template>

      <template v-if="$device.isDesktop || viewType === 'table'">
        <MoleculesReminderDataTable
            :items="groupedReminders"
            :loading="reminderStore.loading"
            :headers="headers"
            :status-config="statusConfig"
            @delete="handleDelete"
        />
      </template>
    </div>

    <v-overlay
        v-if="$device.isMobile"
        v-model="reminderStore.loading"
        class="align-center justify-center"
        persistent
    >
      <v-progress-circular color="primary" indeterminate size="64"/>
    </v-overlay>
  </v-sheet>
</template>

<script setup lang="ts">
import {storeToRefs} from 'pinia'
import {useI18n} from 'vue-i18n'
import {format} from 'date-fns'
import {useReminderStore} from '~/store/reminder'
import type {ReminderGroup} from '~/types/reminder'
import type {ToastType} from "~/composables/openToast"
import ValidationWithWarningDialog from "~/components/molecules/ValidationWithWarningDialog.vue"
import {logEvent} from "firebase/analytics";

const {t} = useI18n()
const {$open, $device, $analytics} = useNuxtApp()
const reminderStore = useReminderStore()
const {reminders} = storeToRefs(reminderStore)

const viewType = ref<'grid' | 'table'>('grid')

const handleViewTypeUpdate = (value: any) => {
  const newViewType = value as 'grid' | 'table'
  if ($analytics) {
    logEvent($analytics, 'change_view_type', {
      view_type: newViewType
    })
  }
}

const groupedReminders = computed((): ReminderGroup[] => {
  const rawReminders = reminders.value
  if (!rawReminders?.length) return []

  // Map<SicknessName, GroupingAccumulator>
  const groups = new Map<string, any>()

  rawReminders.forEach((r) => {
    const key = r.sicknessName || 'General'

    if (!groups.has(key)) {
      groups.set(key, {
        sicknessName: key,
        startDate: new Date(r.scheduledTime),
        endDate: new Date(r.scheduledTime),
        // medsMap: Map<MedicationName, Map<Time, Qty>>
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

    // Deep Grouping: Sickness -> Medication -> Time
    if (!group.medsMap.has(r.medName)) {
      group.medsMap.set(r.medName, new Map<string, string | number>())
    }

    const timeStr = format(rDate, 'HH:mm')
    group.medsMap.get(r.medName).set(timeStr, r.quantity)
    group.ids.push(r.reminderId)

    // Priority status logic
    if (r.status === 'failed') group.status = 'failed'
    else if (group.status !== 'failed' && r.status === 'pending') group.status = 'pending'
  })

  return Array.from(groups.values()).map((g) => {
    // FIX: Explicitly cast entries to avoid the "Argument type unknown" error
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

const handleDelete = async (item: ReminderGroup) => {
  const result = await $open<ToastType>(ValidationWithWarningDialog, {
    scrim: true,
    isPersistent: true,
    title: t('reminders.dialogDelete.title'),
    message: t('reminders.dialogDelete.message')
  })

  if (result === 'success') {
    await reminderStore.deleteReminders(item)
  }
}
</script>
<style scoped>
.view-toggle {
  transition: all 0.3s ease;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.3px;
}
.view-toggle :deep(.v-btn--active) {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: rgb(var(--v-theme-on-primary)) !important;
}

.view-toggle:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.35) !important;
}
</style>
