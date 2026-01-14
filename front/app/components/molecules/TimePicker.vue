<template>
  <div v-bind="$attrs" class="custom-time-picker-wrapper">
    <v-menu
        v-model="isOpen"
        :close-on-content-click="false"
        location="bottom"
        transition="scale-transition"
    >
      <template v-slot:activator="{ props }">
        <v-text-field
            :model-value="modelValue"
            v-bind="props"
            readonly
            variant="outlined"
            rounded="lg"
            density="comfortable"
            hide-details
            prepend-inner-icon="mdi-clock-outline"
            class="w-100"
        />
      </template>

      <v-card min-width="290">
        <v-time-picker
            v-if="isOpen"
            :model-value="modelValue"
            format="24hr"
            full-width
            hide-title
            color="primary"
            @update:model-value="$emit('update:modelValue', $event)"
            @update:minute="isOpen = false"
        />
      </v-card>
    </v-menu>
  </div>
</template>

<script setup>
const modelValue = defineModel()

const isOpen = ref(false)
defineOptions({ inheritAttrs: false })
</script>

<style scoped>
.custom-time-picker-wrapper {
  display: flex;
}

:deep(.v-time-picker-clock__container),
:deep(.v-time-picker-clock__hand) {
  touch-action: none !important;
  -ms-touch-action: none;
}
</style>