<template>
  <v-dialog
    v-model="isActive"
    transition="scroll-y-transition"
    :persistent="isPersistent"
    :scrim="scrim"
    :data-cy="`toast-${toastType}`"
    :class="$device.isMobile ? 'd-flex align-start justify-center' : 'd-flex align-start justify-end'"
    :width="$device.isMobile ? '100%' : 'auto'"
    :max-width="$device.isMobile ? '90%' : '400px'"
    @update:model-value="close"
  >
    <suspense>
      <v-card
        elevation="0"
        class="toast d-flex align-center justify-center pa-4 mt-4 mx-auto"
        :class="{ 'mx-4': $device.isMobile }"
        :color="color"
        :width="$device.isMobile ? '100%' : 'auto'"
        :min-width="$device.isMobile ? '100%' : '250px'"
        :max-width="$device.isMobile ? '100%' : '400px'"
        variant="flat"
      >
        <v-card-title class="title py-0 text-center">
          {{ message }}
        </v-card-title>
      </v-card>
    </suspense>
  </v-dialog>
</template>
<script lang="ts" setup>
import type { ToastType } from '~/composables/openToast';

const { $device } = useNuxtApp()

const isActive = ref(true)
const { close, toastType } = defineProps<{
  scrim: boolean
  isPersistent: boolean
  close: (returnValue?: any) => void
  toastType: ToastType,
  message : string
}>()

const color = computed(() => toastType === 'success' ? '#02be8a' : '#FF600A')

setTimeout(() => {
  close()
}, 5000)
</script>
<style scoped>
.toast {
  border-radius: 8px !important;
}

.title {
  color: #FFF !important;
  font-feature-settings: 'clig' off, 'liga' off !important;
  font-family: Roboto, sans-serif !important;
  font-size: 0.875rem !important;
  font-style: normal !important;
  font-weight: 600 !important;
  line-height: 20px !important;
  white-space: normal;
}
</style>