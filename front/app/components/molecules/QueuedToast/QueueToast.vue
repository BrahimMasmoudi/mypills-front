<template>
  <div class="toast-wrapper py-2">
    <v-card
        elevation="4"
        class="d-flex align-center pa-4"
        :color="color"
        min-width="300"
        max-width="350"
        variant="flat"
    >
      <v-icon :icon="icon" color="white" class="mr-3"></v-icon>
      <div class="d-flex flex-column flex-grow-1">
        <div class="text-body-2 text-white font-weight-bold">
          {{ message }}
        </div>
        
        <div v-if="actions && actions.length > 0" class="d-flex gap-2 mt-2">
          <v-btn
              v-for="(action, index) in actions"
              :key="index"
              size="x-small"
              variant="tonal"
              color="white"
              class="text-capitalize font-weight-bold"
              @click="action.onClick"
          >
            {{ action.label }}
          </v-btn>
        </div>
      </div>

      <v-btn icon="mdi-close" size="x-small" variant="text" color="white" class="ml-auto align-self-start"
             @click="$emit('close')"></v-btn>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import type {QueueToastType} from "~/composables/useQueueToast";

const {type, actions} = defineProps<{
  type: QueueToastType,
  message: string,
  actions?: { label: string, onClick: () => void }[]
}>()

defineEmits(['close'])

const color = computed(() => {
  switch (type) {
    case 'success':
      return '#02be8a'
    case 'error':
      return '#FF600A'
    default:
      return 'grey-darken-3'
  }
})

const icon = computed(() => {
  switch (type) {
    case 'success':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    default:
      return 'mdi-information'
  }
})
</script>

<style scoped>
.toast-wrapper {
  pointer-events: auto; /* Re-enable clicks on the card */
}
</style>