<template>
  <div class="position-absolute top-0 right-0 ma-1 z-index-1">
    <v-menu location="bottom end">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          icon="mdi-dots-vertical"
          variant="text"
          color="medium-emphasis"
          size="small"
          density="comfortable"
          data-cy="pill-menu-button"
          :loading="loadingAction !== null"
          @click.stop
        />
      </template>
      <v-list density="compact" class="rounded-lg">
        <!-- Add Box -->
        <v-list-item
          v-if="(medication.unitsPerBox || 1) > 1"
          class="menu-item"
          @click="handleIncrement(medication.unitsPerBox)"
        >
          <template #prepend>
            <v-icon icon="mdi-plus-box-outline" color="primary" size="small"/>
          </template>
          <v-list-item-title class="text-body-2">
            {{ t('meds.addBox', { count: medication.unitsPerBox }) }}
          </v-list-item-title>
        </v-list-item>

        <!-- Remove Box -->
        <v-list-item
          v-if="(medication.unitsPerBox || 1) > 1"
          class="menu-item"
          :disabled="medication.quantity < (medication.unitsPerBox || 1)"
          @click="handleDecrement(medication.unitsPerBox)"
        >
          <template #prepend>
            <v-icon icon="mdi-minus-box-outline" color="warning" size="small"/>
          </template>
          <v-list-item-title class="text-body-2">
            {{ t('meds.removeBox', { count: medication.unitsPerBox }) }}
          </v-list-item-title>
        </v-list-item>

        <v-divider v-if="(medication.unitsPerBox || 1) > 1" class="my-1"/>

        <!-- Update Box -->
        <v-list-item
          class="menu-item"
          @click="openUpdateUnitsDialog"
        >
          <template #prepend>
            <v-icon icon="mdi-package-variant-closed" color="primary" size="small"/>
          </template>
          <v-list-item-title class="text-body-2">
            {{ t('meds.updateBox') || 'Edit Box Size' }}
          </v-list-item-title>
        </v-list-item>

        <v-divider class="my-1"/>

        <!-- Delete -->
        <v-list-item
          color="error"
          class="menu-item"
          data-cy="menu-delete-button"
          @click="confirmDelete"
        >
          <template #prepend>
            <v-icon icon="mdi-delete-outline" color="error" size="small"/>
          </template>
          <v-list-item-title class="text-body-2 text-error">
            {{ t('meds.delete') }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import type { Medication } from '~/types/medication'
import ValidationWithWarningDialog from '~/components/molecules/ValidationWithWarningDialog.vue'
import UpdateUnitsDialog from '~/components/molecules/medications/UpdateUnitsDialog.vue'
import Toast from '~/components/molecules/Toast.vue'
import { useI18n } from 'vue-i18n'
import type { ToastType } from '~/composables/openToast'

const { $open } = useNuxtApp()
const { t } = useI18n()

const { medication } = defineProps<{
  medication: Medication
}>()

const emit = defineEmits<{
  (e: 'increment-pills', medication: Medication, amount: number, done: () => void): void
  (e: 'decrement-pills', medication: Medication, amount: number, done: () => void): void
  (e: 'delete-pills', medication: Medication, done: () => void): void
}>()

const loadingAction = ref<'increment' | 'decrement' | 'delete' | null>(null)

const handleIncrement = (amount = 1) => {
  loadingAction.value = 'increment'
  emit('increment-pills', medication, amount, () => {
    loadingAction.value = null
  })
}

const handleDecrement = (amount = 1) => {
  loadingAction.value = 'decrement'
  emit('decrement-pills', medication, amount, () => {
    loadingAction.value = null
  })
}

const confirmDelete = async () => {
  const result = await $open<ToastType>(ValidationWithWarningDialog, {
    scrim: true,
    isPersistent: true,
    title: t('dialogDelete.title'),
    message: t('dialogDelete.message')
  })

  if (result === 'success') {
    loadingAction.value = 'delete'
    emit('delete-pills', medication, () => {
      loadingAction.value = null
    })
  }
}

const openUpdateUnitsDialog = async () => {
  const result = await $open(UpdateUnitsDialog, {
    scrim: true,
    isPersistent: false,
    medication: medication
  })

  if (result === 'success') {
    openToast('success', t('meds.toast.updated'))
  } else if (result === 'error') {
    openToast('error', t('meds.toast.error'))
  }
}
</script>

<style scoped>
.z-index-1 {
  z-index: 1;
}
.menu-item {
  cursor: pointer;
}
</style>
