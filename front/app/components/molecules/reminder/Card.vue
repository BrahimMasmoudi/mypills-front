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
          <v-icon icon="mdi-medical-bag" color="primary"/>
        </v-avatar>
        <div>
          <div class="text-subtitle-1 font-weight-bold line-clamp-1">{{ item.sicknessName }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ t('reminders.medsCount', item.medications.length) }}
          </div>
        </div>
      </div>

      <div class="d-flex align-center" style="gap: 4px">
        <template v-if="item.status === 'pending'">
          <v-btn
              icon="mdi-check-circle-outline"
              variant="tonal"
              color="success"
              :loading="loadingAction === 'done'"
              :disabled="!!loadingAction"
              size="small"
              @click="handleAction('done')"
          />

          <v-divider vertical class="mx-1"/>
        </template>

        <v-btn
            v-if="item.status === 'pending'"
            icon="mdi-pencil-outline"
            variant="tonal"
            color="primary"
            :loading="loadingAction === 'edit'"
            :disabled="!!loadingAction"
            size="small"
            @click="handleAction('edit')"
        />

        <v-btn
            v-else-if="item.status === 'done'"
            icon="mdi-reload"
            variant="tonal"
            color="primary"
            :loading="loadingAction === 'edit'"
            :disabled="!!loadingAction"
            size="small"
            @click="handleAction('edit')"
        />

        <v-btn
            icon="mdi-delete-outline"
            variant="tonal"
            color="error"
            :loading="loadingAction === 'delete'"
            :disabled="!!loadingAction"
            size="small"
            @click="handleAction('delete')"
        />
      </div>
    </div>

    <v-divider class="my-3"/>

    <div class="d-flex align-center mb-4">
      <v-icon icon="mdi-calendar-range" size="16" class="mr-2 text-primary"/>
      <span class="text-caption font-weight-bold">
        {{ formatDate(item.startDate) }} - {{ formatDate(item.endDate) }}
      </span>
      <v-spacer/>
      <v-chip :color="statusConfig[item.status].color" size="x-small" variant="flat" class="font-weight-black">
        {{ t(`status.${item.status}`) }}
      </v-chip>
    </div>

    <div class="d-flex flex-column" style="gap: 12px">
      <v-row
          v-for="med in item.medications"
          :key="med.name"
          class="ma-0 align-start medication-row"
          no-gutters
      >
        <v-col cols="5" class="pr-2">
          <v-sheet
              border
              rounded="pill"
              class="px-2 py-1 d-flex align-center w-100 overflow-hidden"
              elevation="0"
          >
            <v-icon icon="mdi-pill" size="14" class="mr-1 text-primary"/>
            <span class="text-caption font-weight-bold text-truncate">
              {{ med.name }}
            </span>
          </v-sheet>
        </v-col>

        <v-col cols="7">
          <div class="d-flex flex-wrap" style="gap: 4px">
            <v-sheet
                v-for="dose in med.doses"
                :key="dose.time"
                border
                rounded="pill"
                class="px-2 py-1 bg-primary d-flex align-center"
            >
              <span class="text-caption font-weight-black text-white" style="font-size: 0.7rem !important;">
                {{ dose.time }}
              </span>
              <v-divider vertical class="mx-1 opacity-50" color="white"/>
              <span class="text-caption text-white font-weight-medium" style="font-size: 0.7rem !important;">
                {{ dose.quantity }}x
              </span>
            </v-sheet>
          </div>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import {format} from 'date-fns'
import type {ReminderGroup} from '~/types/reminder'
import {useI18n} from "vue-i18n";
import {ref} from 'vue' // Added missing ref import

const props = defineProps<{
  item: ReminderGroup,
  statusConfig: any
}>()

const emit = defineEmits(['delete', 'edit', 'finish-treatment'])

const loadingAction = ref<string | null>(null)
const {t} = useI18n()

const formatDate = (date: Date) => date ? format(new Date(date), 'dd MMM') : ''

const handleAction = async (type: 'done' | 'failed' | 'delete' | 'edit' | 'finish-treatment') => {
  loadingAction.value = type

  // Parent must call this 'done' function to stop the loader
  const done = () => {
    loadingAction.value = null
  }

  if (type === 'done' || type === 'finish-treatment') {
    emit('finish-treatment', props.item.ids, 'done', done)
  } else if (type === 'failed') {
    emit('finish-treatment', props.item.ids, 'failed', done)
  } else {
    emit(type as 'delete' | 'edit', props.item, done)
  }
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>