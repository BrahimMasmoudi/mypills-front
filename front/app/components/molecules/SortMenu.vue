<template>
  <v-menu offset-y>
    <template v-slot:activator="{ props }">
      <AtomsSortButton
          v-bind="props"
          :sort-label="currentSortLabel"
          :sort-icon="currentSortIcon"
          :is-active="!!sortBy"
          :sort-order="sortOrder"
      />
    </template>
    
    <v-list density="compact">
      <v-list-item
          v-for="option in sortOptions"
          :key="option.value"
          @click="$emit('update:sortBy', option.value)"
          :active="sortBy === option.value"
      >
        <v-list-item-title>
          <v-icon :icon="option.icon" size="small" class="mr-2"/>
          {{ t(option.label) }}
        </v-list-item-title>
      </v-list-item>
      
      <v-divider v-if="sortBy"/>
      
      <v-list-item v-if="sortBy" @click="$emit('clear')">
        <v-list-item-title class="text-error">
          <v-icon icon="mdi-close" size="small" class="mr-2"/>
          {{ t('sort.clear') }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const {sortBy, sortOptions} = defineProps<{
  sortBy: string | null
  sortOrder: 'asc' | 'desc'
  sortOptions: Array<{ value: string; label: string; icon: string }>
}>()

defineEmits<{
  'update:sortBy': [value: string | null]
  'clear': []
}>()

const currentSortLabel = computed(() => {
  if (!sortBy) return t('sort.label')
  const option = sortOptions.find(opt => opt.value === sortBy)
  return option ? t(option.label) : t('sort.label')
})

const currentSortIcon = computed(() => {
  if (!sortBy) return 'mdi-sort'
  const option = sortOptions.find(opt => opt.value === sortBy)
  return option?.icon || 'mdi-sort'
})
</script>
