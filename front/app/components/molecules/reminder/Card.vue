<template>
  <v-card
      rounded="xl"
      border
      elevation="2"
      class="pa-4 position-relative d-flex flex-column h-100"
  >
    <div class="d-flex justify-space-between align-start mb-2">
      <div class="d-flex align-center">
        <v-avatar color="primary-lighten-5" size="40" class="mr-3 border">
          <v-icon icon="mdi-medical-bag" color="primary" />
        </v-avatar>
        <div>
          <div class="text-subtitle-1 font-weight-bold line-clamp-1">{{ item.sicknessName }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ t('reminders.medsCount', item.medications.length) }}
          </div>
        </div>
      </div>
      <v-btn
          icon="mdi-delete-outline"
          variant="text"
          color="error"
          density="comfortable"
          @click="$emit('delete', item)"
      />
    </div>

    <v-divider class="my-3" />

    <div class="d-flex align-center mb-4">
      <v-icon icon="mdi-calendar-range" size="16" class="mr-2 text-primary" />
      <span class="text-caption font-weight-bold">
        {{ formatDate(item.startDate) }} - {{ formatDate(item.endDate) }}
      </span>
      <v-spacer />
      <v-chip :color="statusConfig[item.status].color" size="x-small" variant="flat" class="font-weight-black">
        {{ t(`status.${item.status}`) }}
      </v-chip>
    </div>

    <div class="d-flex flex-column" style="gap: 16px">
      <div v-for="med in item.medications" :key="med.name" class="medication-section">
        <div class="d-flex align-center mb-2">
          <v-icon icon="mdi-pill" size="14" class="mr-1 text-medium-emphasis" />
          <span class="text-caption font-weight-black text-uppercase tracking-wider text-medium-emphasis">
            {{ med.name }}
          </span>
        </div>

        <div class="d-flex flex-wrap" style="gap: 6px">
          <v-sheet
              v-for="dose in med.doses"
              :key="dose.time"
              border
              rounded="pill"
              class="px-2 py-1 bg-primary d-flex align-center"
          >
            <span class="text-caption font-weight-black text-white">{{ dose.time }}</span>
            <v-divider vertical class="mx-2 opacity-50" color="white" length="10" />
            <span class="text-caption text-white font-weight-medium">{{ dose.qty }}x</span>
          </v-sheet>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import type { ReminderGroup } from '~/types/reminder'
import {useI18n} from "vue-i18n";

defineProps<{
  item: ReminderGroup,
  statusConfig: any
}>()

const { t } = useI18n()
const formatDate = (date: Date) => date ? format(new Date(date), 'dd MMM') : ''
</script>

<style scoped>
.tracking-wider {
  letter-spacing: 0.05em;
}
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.medication-section {
  background: rgba(var(--v-theme-on-surface), 0.02);
  padding: 8px;
  border-radius: 12px;
}
</style>