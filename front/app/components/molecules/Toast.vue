<template>
  <v-dialog v-model="isActive"
            transition="scroll-x-reverse-transition"
            :persistent="isPersistent"
            :scrim="scrim"
            height="60"
            :data-cy="`toast-${toastType}`"
            class="d-flex align-end justify-end"
            :width="$device.isMobile ? '100%' : '250px'"
            @update:modelValue="close">
    <suspense>
      <v-card elevation="0"
              class="toast d-flex align-center justify-center"
              height="60"
              :color="color"
              :width="$device.isMobile ? '100%' : '250px'"
              variant="flat">
        <v-card-title class="title py-0">
          {{ message }}
        </v-card-title>
      </v-card>
    </suspense>
  </v-dialog>
</template>
<script lang="ts" setup>
import type {ToastType} from "~/composables/openToast";

const isActive = ref(true)
const {close, toastType} = defineProps<{
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