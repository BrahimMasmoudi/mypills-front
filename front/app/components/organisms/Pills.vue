<template>
  <v-sheet width="100%" height="calc(100vh - 64px)" class="d-flex flex-column align-start mb-2 overflow-hidden pa-4">
    <div class="w-100 flex-shrink-0">
      <MoleculesMedicationSearchSort
          v-model:search-query="searchQuery"
          v-model:sort-by="sortBy"
          v-model:view-type="viewType"
          :sort-order="sortOrder"
          :sort-options="sortOptions"
          :is-mobile="$device.isMobile"
          @toggle-sort-order="toggleSortOrder"
      />
    </div>

    <div class="w-100 flex-grow-1 overflow-hidden d-flex flex-column">
      <MoleculesMedicationTabs
          v-model="tab"
          :view-type="viewType"
          :all-medication="allMedication"
          :valid-medication="validMedication"
          :expired-medication="expiredMedication"
          @increment-pills="(med, done) => $emit('increment-pills', med, done)"
          @decrement-pills="(med, done) => $emit('decrement-pills', med, done)"
          @delete-pills="(med, done) => $emit('delete-pills', med, done)"
          @update-medication-name="(med, name, done) => $emit('update-medication-name', med, name, done)"
      />
    </div>

    <v-sheet v-if="medicationLoading" width="100%" height="100%"
             class="position-absolute top-0 left-0 d-flex align-center justify-center bg-surface opacity-80"
             style="z-index: 5;">
      <v-row class="d-flex align-start justify-start pa-4 w-100 h-100">
        <v-col v-for="i in 8" :key="i" md="3" cols="6">
          <AtomsLoadingMed/>
        </v-col>
      </v-row>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import type {Medication} from "~/types/medication"

const {medications} = defineProps<{
  medications: Medication[] | undefined
  medicationLoading: boolean
}>()

defineEmits<{
  (e: 'create-medication', medication: Medication): void
  (e: 'increment-pills', medication: Medication, done: () => void): void
  (e: 'decrement-pills', medication: Medication, done: () => void): void
  (e: 'delete-pills', medication: Medication, done: () => void): void
  (e: 'update-medication-name', medication: Medication, newName: string, done: () => void): void
}>()

const searchQuery = ref('')
const viewType = ref<'grid' | 'table'>('grid')
const sortBy = ref<'name' | 'expiryDate' | 'quantity' | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')
const tab = ref<string>('all')

const sortOptions = [
  {value: 'name' as const, label: 'sort.name', icon: 'mdi-alphabetical'},
  {value: 'expiryDate' as const, label: 'sort.expiryDate', icon: 'mdi-calendar-clock'},
  {value: 'quantity' as const, label: 'sort.quantity', icon: 'mdi-counter'}
]

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const sortMedications = (meds: Medication[]) => {
  if (!sortBy.value) return meds
  return [...meds].sort((a, b) => {
    let comparison = 0
    switch (sortBy.value) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'expiryDate': {
        const getDateValue = (v: any) => v?.toDate?.()?.getTime() ?? new Date(v).getTime()
        comparison = getDateValue(a.expiryDate) - getDateValue(b.expiryDate)
        break
      }
      case 'quantity':
        comparison = a.quantity - b.quantity
        break
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
}

const filterAndSort = (meds: Medication[]) => {
  const query = searchQuery.value.toLowerCase()
  const filtered = meds.filter(m => m.name.toLowerCase().includes(query))
  return sortMedications(filtered)
}

const validMedication = computed(() => filterAndSort(medications?.filter(m => !m.expired) ?? []))
const expiredMedication = computed(() => filterAndSort(medications?.filter(m => m.expired) ?? []))
const allMedication = computed(() => filterAndSort(medications ?? []))
</script>