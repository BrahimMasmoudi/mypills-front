<template>
  <v-card border elevation="0" rounded="xl" class="bg-surface overflow-hidden">
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
            <v-icon icon="mdi-medical-bag" color="primary" size="20" />
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
            <v-icon icon="mdi-pill" size="14" class="mr-2 text-primary" />
            <span class="text-caption font-weight-bold text-truncate" style="max-width: 120px;">
              {{ name }}
            </span>
          </v-sheet>
        </div>
      </template>

      <template #[`item.dateRange`]="{ item }">
        <v-sheet border rounded="pill" class="px-3 py-1 bg-surface-variant d-flex align-center" width="fit-content">
          <span class="text-caption font-weight-bold">{{ formatDate(item.startDate) }}</span>
          <v-icon icon="mdi-arrow-right" size="12" class="mx-2 opacity-50" />
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
            <v-icon icon="mdi-clock-outline" size="14" color="white" class="mr-2" />
            <span class="text-caption font-weight-black text-white">{{ dose.time }}</span>
            <v-divider vertical class="mx-2 border-opacity-50" color="white" length="12" />
            <span class="text-caption font-weight-medium text-white opacity-90">{{ dose.qty }}x</span>
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
        <v-btn
            icon="mdi-delete-outline"
            variant="tonal"
            color="error"
            size="small"
            @click="$emit('delete', item)"
        />
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import type { ReminderGroup } from '~/types/reminder'
import { useI18n } from "vue-i18n";

defineProps<{
  items: ReminderGroup[]
  loading: boolean
  headers: any[]
  statusConfig: any
}>()

const { t } = useI18n()
const formatDate = (date: Date) => date ? format(new Date(date), 'dd MMM') : ''
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