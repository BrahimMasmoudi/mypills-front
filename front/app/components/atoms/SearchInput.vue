<template>
  <v-text-field
    :model-value="modelValue"
    :label="label"
    :placeholder="placeholder"
    variant="solo"
    density="comfortable"
    hide-details
    single-line
    clearable
    rounded="pill"
    class="search-input"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #prepend-inner>
      <v-icon icon="mdi-magnify" color="primary"/>
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.search-input {
  transition: all 0.3s ease;
}

.search-input:deep(.v-field) {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.search-input:deep(.v-field:hover) {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}
</style>
