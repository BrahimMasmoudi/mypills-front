<template>
  <div class="toast-container">
    <TransitionGroup name="toast-slide">
      <QueueToast
          v-for="item in toasts"
          :key="item.id"
          :message="item.message"
          :type="item.type"
          :actions="item.actions"
          @close="removeToast(item.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">

import QueueToast from "~/components/molecules/QueuedToast/QueueToast.vue";

const { toasts, removeToast } = useQueueToast()
</script>

<style scoped>
/* Position the stack container */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column; /* This creates the stack effect */
  pointer-events: none; /* Let clicks pass through empty space */
}

/* Animations */
.toast-slide-move, /* applying moving transition to moving elements */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s ease;
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(30px); /* Slide in from right */
}

/* Ensure removed items are taken out of flow smoothly */
.toast-slide-leave-active {
  position: absolute;
}
</style>