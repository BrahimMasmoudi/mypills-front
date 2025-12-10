<template>
  <v-sheet width="100%"
           class="d-flex flex-column align-start fill-height pa-4 mb-2">
    <!-- Tabs Header -->
    <v-sheet class="w-100 flex-shrink-0" min-height="60">
      <v-tabs
        v-model="tab"
        align-tabs="center"
        class="mb-2 w-100"
        hide-slider
        height="60"
        :selected-class="tab === 'valid' ? 'bg-primary-lighten' : 'bg-error-lighten'"
      >
        <v-tab
            value="valid"
            class="text-capitalize font-weight-bold text-subtitle-1 rounded-pill text-primary"
            height="48"
            :class="{'bg-primary-lighten': tab === 'valid'}"
            color="primary"
            variant="text"
        >
          <template #prepend v-if="!$device.isMobile">
            <nuxt-icon name="validate-edit-action"/>
          </template>
          {{ $device.isMobile ? t('meds.valid') : t('meds.valid_long') }}
          <v-badge
            :content="validMedication.length"
            color="primary"
            inline
          />
        </v-tab>
        
        <v-tab
            value="expired"
            height="48"
            class="text-capitalize font-weight-bold text-subtitle-1 rounded-pill text-error"
            :color="tab === 'expired' ? 'error' : 'default'"
            variant="text"
        >
          <template #prepend v-if="!$device.isMobile">
            <nuxt-icon name="error-warning"/>
          </template>
          {{ $device.isMobile ? t('meds.expired') : t('meds.expired_long') }}
          <v-badge
            :content="expiredMedication.length"
            color="error"
            inline
          />
        </v-tab>
      </v-tabs>
    </v-sheet>

    <!-- Search and Sort Controls -->
    <MoleculesMedicationSearchSort
        v-model:search-query="searchQuery"
        v-model:sort-by="sortBy"
        :sort-order="sortOrder"
        :sort-options="sortOptions"
        :is-mobile="$device.isMobile"
        @toggle-sort-order="toggleSortOrder"
        @create="openDialog"
    />

    <!-- Tabs Content -->
    <v-window v-model="tab" class="w-100 fill-height">
      <v-window-item value="valid" class="fill-height">
        <MoleculesPills
            v-if="validMedication.length > 0"
            :is-expired="false"
            name="valide pills"
            :medications="validMedication"
            :decrement-pills="decrementPills"
            :increment-pills="incrementPills"
            :delete-pills="deletePills"
            :update-medication-name="updateMedicationName"/>
        
        <v-sheet width="100%" height="100%" v-else
               class="d-flex flex-column align-center justify-center font-weight-bold">
          <v-img :src="useAsset('/assets/img/no-result-new.png')" max-height="400" width="400"/>
          {{ t('meds.no-result') }}
        </v-sheet>
      </v-window-item>

      <v-window-item value="expired" class="w-100 fill-height">
        <MoleculesPills
            v-if="expiredMedication.length > 0"
            :is-expired="true"
            name="expired pills"
            :medications="expiredMedication"
            :decrement-pills="decrementPills"
            :increment-pills="incrementPills"
            :delete-pills="deletePills"
            :update-medication-name="updateMedicationName"/>

        <v-sheet width="100%" height="100%" v-else
               class="d-flex flex-column align-center justify-center font-weight-bold">
          <v-img :src="useAsset('/assets/img/no-result-new.png')" max-height="400" width="400"/>
          {{ t('meds.no-result') }}
        </v-sheet>
      </v-window-item>
    </v-window>

    <v-fab
        v-if="$device.isMobile"
        color="primary"
        icon="mdi-plus"
        size="x-large"
        location="bottom end"
        app
        @click="openDialog"
    />

    <v-sheet width="100%" v-if="medicationLoading" class="position-absolute top-0 left-0 h-100 d-flex align-center justify-center bg-surface opacity-80" style="z-index: 5;">
       <v-row class="d-flex align-start justify-start my-3 w-100">
        <v-col v-for="i in 8"
               :key="i"
               md="3"
               cols="6">
          <AtomsLoadingMed/>
        </v-col>
      </v-row>
    </v-sheet>
  </v-sheet>
</template>
<script setup lang="ts">
import type {Filter} from "~/types/Filter";
import type {Medication} from "~/types/medication";
import {useI18n} from "vue-i18n";
import Dialog from "~/components/molecules/Dialog.vue";
import {openToast, type ToastType} from "~/composables/openToast";
import {getCurrentUser} from "vuefire";

const {t} = useI18n()
const {$open, $device} = useNuxtApp()
const searchQuery = ref('')
const sortBy = ref<'name' | 'expiryDate' | 'quantity' | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')
const sortOptions = [
  { value: 'name' as const, label: 'sort.name', icon: 'mdi-alphabetical' },
  { value: 'expiryDate' as const, label: 'sort.expiryDate', icon: 'mdi-calendar-clock' },
  { value: 'quantity' as const, label: 'sort.quantity', icon: 'mdi-counter' }
]

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const sortMedications = (meds: Medication[]) => {
  if (!sortBy.value) return meds
  
  const sorted = [...meds].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy.value) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'expiryDate':
        // Handle Firestore Timestamp objects, Date objects, and date strings
        const getDateValue = (dateValue: any): number => {
          // Check if it's a Firestore Timestamp (has toDate method)
          if (dateValue && typeof dateValue.toDate === 'function') {
            return dateValue.toDate().getTime()
          }
          // Check if it's already a Date object
          if (dateValue instanceof Date) {
            return dateValue.getTime()
          }
          // Otherwise treat as string and convert
          return new Date(dateValue).getTime()
        }
        
        const timeA = getDateValue(a.expiryDate)
        const timeB = getDateValue(b.expiryDate)
        
        comparison = timeA - timeB
        break
      case 'quantity':
        comparison = a.quantity - b.quantity
        break
    }
    
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
  
  return sorted
}

const props = defineProps<{
  filter: Filter
  medications: Medication[] | undefined
  createMedication: (medication: Medication) => Promise<void>
  incrementPills: (medication: Medication) => Promise<void>
  decrementPills: (medication: Medication) => Promise<void>
  deletePills: (medication: Medication) => Promise<void>
  updateMedicationName: (medication: Medication, newName: string) => Promise<void>
  medicationLoading: boolean
}>()

const validMedication = computed(() => {
  const filtered = props.medications?.filter((med: Medication) => !med.expired) ?? []
  const searched = !searchQuery.value 
    ? filtered 
    : filtered.filter(med => med.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  return sortMedications(searched)
})

const expiredMedication = computed(() => {
  const filtered = props.medications?.filter((med: Medication) => med.expired) ?? []
  const searched = !searchQuery.value 
    ? filtered 
    : filtered.filter(med => med.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  return sortMedications(searched)
})

// Tab Logic
const tab = ref<string>('valid')

const openDialog = async () => {
  const user = await getCurrentUser()

  const toastType = await $open<ToastType>(Dialog, {
    scrim: true,
    isPersistent: true,
    createMedication: props.createMedication,
    userUid: user?.uid,
    email: user?.email
  })
  if(toastType !== 'canceled') openToast(toastType, t(toastType))
}
</script>
<style scoped>
.search-field-centered {
  transition: all 0.3s ease;
}

.search-field-centered:deep(.v-field) {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.search-field-centered:deep(.v-field:hover) {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.search-field-mobile {
  transition: all 0.3s ease;
}

.search-field-mobile:deep(.v-field) {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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

.bg-primary-lighten {
  background-color: rgba(var(--v-theme-primary), 0.2) !important;
}

.bg-error-lighten {
  background-color: rgba(var(--v-theme-error), 0.2) !important;
}

.v-tabs--density-default {
  height: 60px !important;
}
</style>