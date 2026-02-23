<template>
  <!-- Desktop Layout -->
  <v-dialog
    v-if="$device.isDesktop"
    v-model="isActive"
    :persistent="isPersistent"
    :scrim="scrim"
    :width="width"
    data-cy="validation-with-warning-dialog"
    content-class="elevation-0"
    @keydown.esc="cancelAndClose"
  >
    <v-card class="rounded-xl pa-6" elevation="24">
      <div class="d-flex flex-column align-center text-center">
        <!-- Icon -->
        <v-avatar color="red-lighten-5" size="80" class="mb-4">
          <v-icon icon="mdi-alert-circle-outline" color="error" size="48" />
        </v-avatar>

        <!-- Title -->
        <v-card-title class="text-h5 font-weight-bold pt-0 pb-2">
          {{ title }}
        </v-card-title>

        <!-- Dynamic Content/Message -->
        <v-card-text class="text-body-1 text-medium-emphasis py-2 px-6">
          {{ message }}
        </v-card-text>

        <!-- Actions -->
        <v-card-actions class="w-100 justify-center pt-6 gap-4">
          <v-btn
            variant="outlined"
            size="large"
            color="grey-darken-1"
            class="flex-grow-1 text-capitalize font-weight-bold"
            height="48"
            @click="cancelAndClose"
          >
            {{ t('cancel') }}
          </v-btn>

          <v-btn
            color="error"
            variant="flat"
            size="large"
            class="flex-grow-1 text-capitalize font-weight-bold"
            height="48"
            data-cy="confirm-deletion-button"
            :loading="loading"
            @click="onConfirmClick"
          >
            {{ t('confirm') }}
          </v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>

  <!-- Mobile Layout (Bottom Sheet Style) -->
  <v-dialog
    v-else
    v-model="isActive"
    :persistent="isPersistent"
    :scrim="scrim"
    color="transparent"
    width="100%"
    class="align-end ma-0"
    @keydown.esc="cancelAndClose"
  >
    <v-card class="rounded-t-xl pa-5 pb-8" elevation="0">
      <div class="d-flex flex-column align-center text-center">
        <!-- Drag Handle Indicator -->
        <v-sheet
          color="grey-lighten-2"
          height="4"
          width="40"
          class="rounded-pill mb-6"
        />

        <v-avatar color="red-lighten-5" size="72" class="mb-4">
          <v-icon icon="mdi-alert-circle-outline" color="error" size="40" />
        </v-avatar>

        <h3 class="text-h6 font-weight-bold mb-2">
          {{ title }}
        </h3>

        <p class="text-body-2 text-medium-emphasis px-4 mb-6">
          {{ message }}
        </p>

        <div class="d-flex flex-column w-100 gap-3">
          <v-btn
            block
            color="error"
            variant="flat"
            size="x-large"
            data-cy="confirm-deletion-button"
            class="text-capitalize font-weight-bold rounded-lg"
            :loading="loading"
            @click="onConfirmClick"
          >
            {{ t('confirm') }}
          </v-btn>

          <v-btn
            block
            variant="text"
            size="large"
            color="grey-darken-1"
            class="text-capitalize font-weight-bold mt-2"
            @click="cancelAndClose"
          >
            {{ t('cancel') }}
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import type { ToastType } from '~/composables/openToast';

const { t } = useI18n()
const isActive = ref(true)
const loading = ref(false)
const { close, width = 600 } = defineProps<{
  close: (toastType: ToastType) => void
  isPersistent: boolean
  scrim: boolean
  title: string
  message: string
  width?: number
}>()

const onConfirmClick = () => close('success')

const cancelAndClose = () => close('canceled')
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}
.gap-3 {
  gap: 12px;
}
</style>