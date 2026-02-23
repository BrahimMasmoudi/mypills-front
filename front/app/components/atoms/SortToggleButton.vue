<template>
  <v-btn
    icon
    :variant="variant"
    :size="size"
    :color="color"
    :title="title"
    v-bind="$attrs"
    class="sort-toggle-btn"
    @click="$emit('toggle')"
  >
    <v-icon :icon="sortOrder === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'"/>
  </v-btn>
</template>

<script setup lang="ts">
const {
  variant = 'outlined',
  color = 'primary',
  title = '',
  size = 'small'
} = defineProps<{
  sortOrder: 'asc' | 'desc'
  title?: string
  variant?: 'text' | 'flat' | 'elevated' | 'outlined' | 'plain' | 'tonal'
  size?: string
  color?: string
}>()

defineEmits<{
  toggle: []
}>()
</script>

<style scoped>
.sort-toggle-btn {
  transition: all 0.2s ease;
}

.sort-toggle-btn:hover {
  transform: scale(1.1);
}
</style>
