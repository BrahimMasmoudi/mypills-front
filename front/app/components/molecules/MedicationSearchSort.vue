<template>
  <div class="w-100 d-flex justify-center align-center position-relative">
    <div v-if="!isMobile" class="desktop-header">
      <v-sheet class="d-flex align-center justify-center" width="100%">
        <AtomsSearchInput
            :model-value="searchQuery"
            @update:model-value="$emit('update:searchQuery', $event)"
            :label="t('search')"
            class="search-input-desktop mr-4"
        />

         <AtomsSortToggleButton
            v-if="sortBy"
            :sort-order="sortOrder"
            color="primary"
            size="small"
            class="mr-4"
            @toggle="$emit('toggleSortOrder')"
        />
        
        <MoleculesSortMenu
            :sort-by="sortBy"
            :sort-order="sortOrder"
            :sort-options="sortOptions"
            @update:sort-by="$emit('update:sortBy', $event)"
            @clear="$emit('update:sortBy', null)"
        />
        
        <v-btn
            color="primary"
            size="large"
            variant="elevated"
            rounded="pill"
            class="add-pill-btn-floating ml-4"
            @click="$emit('create')"
        >
          <v-icon icon="mdi-plus" class="mr-2"/>
          {{ t('add-pill') }}
        </v-btn>
      </v-sheet>
    </div>

    <!-- Mobile Layout -->
    <div v-else class="w-100 mb-3">
      <div class="d-flex align-center">
        <AtomsSearchInput
            :model-value="searchQuery"
            @update:model-value="$emit('update:searchQuery', $event)"
            :label="t('search')"
            class="flex-grow-1"
        />
        
        <v-btn
            icon="'mdi-sort'"
            color="primary"
            class="ml-2"
            @click="sortSheetOpen = true"
        >
          <v-icon v-if="sortBy" :icon="currentSortIcon"/>
          <v-icon v-else icon="mdi-sort"/>
        </v-btn>
        
        <AtomsSortToggleButton
            v-if="sortBy"
            :sort-order="sortOrder"
            @toggle="$emit('toggleSortOrder')"
            variant="outlined"
            color="primary"
            class="ml-2"
        />
      </div>
      
      <MoleculesSortBottomSheet
          v-model="sortSheetOpen"
          :sort-by="sortBy"
          :sort-order="sortOrder"
          :sort-options="sortOptions"
          @update:sort-by="$emit('update:sortBy', $event)"
          @toggle-order="$emit('toggleSortOrder')"
          @clear="$emit('update:sortBy', null)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  searchQuery: string
  sortBy: string | null
  sortOrder: 'asc' | 'desc'
  sortOptions: Array<{ value: string; label: string; icon: string }>
  isMobile: boolean
}>()

defineEmits<{
  'update:searchQuery': [value: string]
  'update:sortBy': [value: string | null]
  'toggleSortOrder': []
  'create': []
}>()

const sortSheetOpen = ref(false)

const currentSortIcon = computed(() => {
  if (!props.sortBy) return 'mdi-sort'
  const option = props.sortOptions.find(opt => opt.value === props.sortBy)
  return option?.icon || 'mdi-sort'
})
</script>

<style scoped>
.desktop-header {
  width: 100%;
  margin-bottom: 1rem;
}

.search-input-desktop {
  max-width: 500px;
  flex-shrink: 0;
}

.search-field-centered {
  transition: all 0.3s ease;
}

.add-pill-btn-floating {
  transition: all 0.3s ease;
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.add-pill-btn-floating:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.35) !important;
}
</style>
