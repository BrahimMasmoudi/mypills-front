<template>
  <v-bottom-sheet :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="text-center">{{ t('sort.label') }}</v-card-title>
      
      <v-list>
        <v-list-item
            v-for="option in sortOptions"
            :key="option.value"
            @click="handleSortSelect(option.value)"
            :active="sortBy === option.value"
        >
          <template #prepend>
            <v-icon :icon="option.icon" class="mr-3"/>
          </template>
          <v-list-item-title>{{ t(option.label) }}</v-list-item-title>
        </v-list-item>
        
        <v-divider v-if="sortBy"/>
        
        <v-list-item v-if="sortBy" @click="handleClear">
          <template #prepend>
            <v-icon icon="mdi-close" class="mr-3"/>
          </template>
          <v-list-item-title class="text-error">{{ t('sort.clear') }}</v-list-item-title>
        </v-list-item>
        
        <v-divider/>
        
        <v-list-item @click="$emit('toggleOrder')">
          <template #prepend>
            <v-icon :icon="sortOrder === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'" class="mr-3"/>
          </template>
          <v-list-item-title>
            {{ sortOrder === 'asc' ? t('sort.ascending') : t('sort.descending') }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  modelValue: boolean
  sortBy: string | null
  sortOrder: 'asc' | 'desc'
  sortOptions: Array<{ value: string; label: string; icon: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:sortBy': [value: string | null]
  'toggleOrder': []
  'clear': []
}>()

const handleSortSelect = (value: string) => {
  emit('update:sortBy', value)
  emit('update:modelValue', false)
}

const handleClear = () => {
  emit('clear')
  emit('update:modelValue', false)
}
</script>
