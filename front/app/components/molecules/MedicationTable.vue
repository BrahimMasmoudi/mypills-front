<template>
  <v-data-table
      :headers="headers"
      :items="medications"
      class="elevation-2 medication-table rounded-xl"
      fixed-header
      height="90vh"
      hide-default-footer
      :items-per-page="-1"
  >
    <template #[`item.name`]="{ item }">
      <div class="d-flex align-center">
        <v-avatar size="32" class="mr-3">
          <nuxt-icon filled :name="item.image" class="table-pill-icon"/>
        </v-avatar>
        <span class="font-weight-bold">{{ item.name }}</span>
      </div>
    </template>

    <template #[`item.quantity`]="{ item }">
      <v-chip
          size="small"
          class="font-weight-bold"
          :color="item.expired ? 'error' : 'primary'"
          variant="flat"
      >
        {{ item.quantity }}
      </v-chip>
    </template>

    <template #[`item.expiryDate`]="{ item }">
      <v-chip
          :color="item.expired ? 'error' : 'success'"
          :variant="item.expired ? 'flat' : 'tonal'"
          size="small"
          class="font-weight-medium"
      >
        <v-icon start icon="mdi-calendar-clock" size="x-small"/>
        {{ parseDate(item.expiryDate) }}
      </v-chip>
    </template>

    <template #[`item.actions`]="{ item }">
      <div class="d-flex align-center justify-end">
        <v-btn
            icon="mdi-minus"
            size="x-small"
            variant="tonal"
            color="warning"
            class="mr-2 action-btn"
            :disabled="item.quantity <= 1"
            @click.stop="handleDecrement(item)"
            :loading="loadingStates[item.medicationId]?.decrement"
        />

        <v-btn
            icon="mdi-plus"
            size="x-small"
            variant="tonal"
            color="success"
            class="mr-2 action-btn"
            @click.stop="handleIncrement(item)"
            :loading="loadingStates[item.medicationId]?.increment"
        />

        <v-btn
            icon="mdi-pencil-outline"
            size="x-small"
            variant="tonal"
            color="info"
            class="mr-2 action-btn"
            @click.stop="handleRename(item)"
            :loading="loadingStates[item.medicationId]?.rename"
        />

        <v-btn
            icon="mdi-delete-outline"
            size="x-small"
            variant="tonal"
            color="error"
            class="action-btn"
            @click.stop="confirmDelete(item)"
            :loading="loadingStates[item.medicationId]?.delete"
        />
      </div>
    </template>

    <template #bottom></template>
  </v-data-table>

  <v-dialog v-model="renameDialog" max-width="400">
    <v-card rounded="xl" class="pa-4">
      <v-card-title class="text-h6 font-weight-bold mx-auto">{{ t('dialogRename.title') }}</v-card-title>
      <v-card-text>
        <v-text-field
            v-model="editedName"
            :label="t('medicationName')"
            variant="outlined"
            density="comfortable"
            hide-details
            autofocus
            @keydown.enter="saveRename"
        />
      </v-card-text>
      <v-card-actions class="w-100 justify-center pt-2 gap-4">
        <v-btn variant="outlined" size="large" color="grey-darken-1"
               class="flex-grow-1 text-capitalize font-weight-bold" height="48" @click="renameDialog = false">
          {{ t('cancel') }}
        </v-btn>
        <v-btn color="primary" variant="flat" size="large" class="flex-grow-1 text-capitalize font-weight-bold"
               height="48" :loading="selectedMed ? loadingStates[selectedMed.medicationId]?.rename : false" @click="saveRename">
          {{ t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Medication } from '~/types/medication'
import { parseDate } from "~/composables/parseDate"
import ValidationWithWarningDialog from "~/components/molecules/ValidationWithWarningDialog.vue"
import type {ToastType} from "~/composables/openToast";

const { t } = useI18n()
const { $open } = useNuxtApp()

defineProps<{
  medications: Medication[]
}>()

const emit = defineEmits<{
  (e: 'increment-pills', medication: Medication, done: () => void): void
  (e: 'decrement-pills', medication: Medication, done: () => void): void
  (e: 'delete-pills', medication: Medication, done: () => void): void
  (e: 'update-medication-name', medication: Medication, newName: string, done: () => void): void
}>()

const headers = computed(() => [
  { title: t('meds.name'), key: 'name', align: 'start' as const },
  { title: t('meds.quantity'), key: 'quantity', align: 'center' as const },
  { title: t('meds.expiryDate'), key: 'expiryDate', align: 'center' as const },
  { title: t('meds.actions'), key: 'actions', align: 'end' as const, sortable: false },
])

const loadingStates = ref<Record<string, { increment?: boolean, decrement?: boolean, delete?: boolean, rename?: boolean }>>({})

const startLoading = (id: string, action: 'increment' | 'decrement' | 'delete' | 'rename') => {
  if (!loadingStates.value[id]) loadingStates.value[id] = {}
  loadingStates.value[id][action] = true
}

const stopLoading = (id: string, action: 'increment' | 'decrement' | 'delete' | 'rename') => {
  if (loadingStates.value[id]) {
    loadingStates.value[id][action] = false
  }
}

const handleIncrement = (item: Medication) => {
  startLoading(item.medicationId, 'increment')
  emit('increment-pills', item, () => stopLoading(item.medicationId, 'increment'))
}

const handleDecrement = (item: Medication) => {
  startLoading(item.medicationId, 'decrement')
  emit('decrement-pills', item, () => stopLoading(item.medicationId, 'decrement'))
}

const confirmDelete = async (item: Medication) => {
  const result = await $open<ToastType>(ValidationWithWarningDialog, {
    scrim: true,
    isPersistent: true,
    title: t('dialogDelete.title'),
    message: t('dialogDelete.message')
  })

  if (result === 'success') {
    startLoading(item.medicationId, 'delete')
    emit('delete-pills', item, () => stopLoading(item.medicationId, 'delete'))
  }
}

const renameDialog = ref(false)
const selectedMed = ref<Medication | null>(null)
const editedName = ref('')

const handleRename = (item: Medication) => {
  selectedMed.value = item
  editedName.value = item.name
  renameDialog.value = true
}

const saveRename = () => {
  if (!selectedMed.value || !editedName.value.trim() || editedName.value === selectedMed.value.name) {
    renameDialog.value = false
    return
  }

  const med = selectedMed.value
  startLoading(med.medicationId, 'rename')

  emit('update-medication-name', med, editedName.value.trim(), () => {
    stopLoading(med.medicationId, 'rename')
    renameDialog.value = false
  })
}
</script>

<style scoped>
.medication-table {
  background: transparent !important;
}

.action-btn {
  transition: transform 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

:deep(.v-data-table__th) {
  font-weight: 800 !important;
  text-transform: uppercase;
  font-size: 0.75rem !important;
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
  letter-spacing: 0.05em;
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.03) !important;
}

.table-pill-icon {
  font-size: 20px;
}

.gap-4 {
  gap: 16px;
}
</style>