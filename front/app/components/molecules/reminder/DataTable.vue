<template>
  <v-card
    border
    elevation="0"
    rounded="xl"
    class="bg-surface overflow-hidden mt-2"
  >
    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
      hover
      fixed-header
      height="calc(100vh - 220px)"
      hide-default-footer
      :items-per-page="-1"
      class="bg-transparent"
    >
      <template v-for="header in headers" :key="header.key" #[`header.${header.key}`]="{ column }">
        <span class="text-overline font-weight-black text-medium-emphasis">
          {{ column.title }}
        </span>
      </template>

      <template #[`item.sicknessName`]="{ item }">
        <div class="d-flex align-center py-2">
          <v-avatar color="primary-lighten-5" size="36" class="mr-3 border">
            <v-icon icon="mdi-medical-bag" color="primary" size="20"/>
          </v-avatar>
          <span class="font-weight-bold text-body-1">{{ item.sicknessName || t('reminders.general') }}</span>
        </div>
      </template>

      <template #[`item.medName`]="{ item }">
        <div class="d-flex flex-wrap" style="gap: 6px">
          <v-sheet
            v-for="name in item.medNames"
            :key="name"
            border
            rounded="pill"
            class="px-3 py-1 d-flex align-center"
            elevation="0"
          >
            <v-icon icon="mdi-pill" size="14" class="mr-2 text-primary"/>
            <span class="text-caption font-weight-bold text-truncate" style="max-width: 120px;">
              {{ name }}
            </span>
          </v-sheet>
        </div>
      </template>

      <template #[`item.dateRange`]="{ item }">
        <v-sheet
          border
          rounded="pill"
          class="px-3 py-1 d-flex align-center"
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
            class="px-3 py-1 bg-primary d-flex align-center"
          >
            <v-icon
              icon="mdi-clock-outline"
              size="14"
              color="white"
              class="mr-2"
            />
            <span class="text-caption font-weight-black text-white">{{ dose.time }}</span>
            <v-divider vertical class="mx-2 border-opacity-50" color="white"/>
            <span class="text-caption font-weight-medium text-white opacity-90">{{ dose.quantity }}x</span>
          </v-sheet>
        </div>
      </template>

      <template #[`item.status`]="{ item }">
        <v-chip
          :color="statusConfig[item.status].color"
          :prepend-icon="statusConfig[item.status].icon"
          size="x-small"
          variant="flat"
          class="text-uppercase font-weight-black px-3"
        >
          {{ t(`status.${item.status}`) }}
        </v-chip>
      </template>

      <template #[`item.actions`]="{ item }">
        <div class="d-flex align-center justify-end" style="gap: 8px">
          <template v-if="item.status === 'pending'">
            <v-btn
              icon="mdi-check-circle-outline"
              variant="tonal"
              color="success"
              size="small"
              :loading="getLoading(item, 'sent')"
              :disabled="isAnyLoading(item)"
              @click="handleAction(item, 'finish-treatment', 'done')"
            />
          </template>

          <v-divider v-if="item.status === 'pending'" vertical class="mx-1" />

          <v-btn
            v-if="item.status === 'pending'"
            icon="mdi-pencil-outline"
            variant="tonal"
            color="primary"
            size="small"
            :loading="getLoading(item, 'edit')"
            :disabled="isAnyLoading(item)"
            @click="handleAction(item, 'edit')"
          />

          <v-btn
            v-else-if="item.status === 'done'"
            icon="mdi-reload"
            variant="tonal"
            color="primary"
            size="small"
            :loading="getLoading(item, 'edit')"
            :disabled="isAnyLoading(item)"
            @click="handleAction(item, 'edit')"
          />

          <v-btn
            icon="mdi-delete-outline"
            variant="tonal"
            color="error"
            size="small"
            :loading="getLoading(item, 'delete')"
            :disabled="isAnyLoading(item)"
            @click="handleAction(item, 'delete')"
          />
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { enUS, fr } from 'date-fns/locale'
import type { ReminderGroup } from '~/types/reminder'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const props = defineProps<{
  items: ReminderGroup[]
  loading: boolean
  headers: any[]
  statusConfig: any
}>()

const emit = defineEmits(['delete', 'finish-treatment', 'edit'])
const { t, locale } = useI18n()

// Track loading per item group { "SicknessName": "done" | "failed" | "delete" | "edit" | null }
const loadingStates = ref<Record<string, string | null>>({})

/**
 * Checks if a specific action is loading for a row
 */
const getLoading = (item: ReminderGroup, action: string) =>
    loadingStates.value[item.sicknessName] === action

/**
 * Disables other buttons in the same row when one is loading
 */
const isAnyLoading = (item: ReminderGroup) =>
    !!loadingStates.value[item.sicknessName]

/**
 * Handles clicks by setting local state and calling parent emitters
 */
const handleAction = async (item: ReminderGroup, emitName: 'delete' | 'finish-treatment' | 'edit', status?: string) => {
  const actionKey = status || emitName
  loadingStates.value[item.sicknessName] = actionKey

  // This callback is passed to the parent to reset the button spinner
  const done = () => {
    loadingStates.value[item.sicknessName] = null
  }

  if (emitName === 'delete' || emitName === 'edit') {
    emit(emitName, item, done)
  } else {
    emit('finish-treatment', item.ids, (status || 'done') as any, done)
  }
}

const locales: Record<string, any> = { en: enUS, fr: fr }
const formatDate = (date: Date | string) => {
  if (!date) return ''
  return format(new Date(date), 'dd MMM', { locale: locales[locale.value] || enUS })
}
</script>

<style scoped>
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