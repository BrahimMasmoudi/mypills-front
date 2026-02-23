<template>
  <v-btn
    v-bind="$attrs"
    color="primary"
    :variant="isActive ? 'elevated' : 'outlined'"
    size="large"
    rounded="pill"
    class="sort-btn"
  >
    <v-icon :icon="sortIcon" class="mr-2"/>
    <span>{{ sortLabel }}</span>
    <v-icon 
      v-if="isActive && sortOrder"
      :icon="sortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'" 
      size="small"
      class="ml-2"
    />
  </v-btn>
</template>

<script setup lang="ts">
defineProps<{
  sortLabel: string
  sortIcon: string
  isActive: boolean
  sortOrder?: 'asc' | 'desc'
}>()
</script>

<style scoped>
.sort-btn {
  transition: all 0.3s ease;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.sort-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--v-theme-primary), 0.25) !important;
}
</style>
