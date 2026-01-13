<template>
  <v-sheet width="100%"
           height="calc(100vh - 64px)"
           class="d-flex flex-column align-start mb-2 overflow-hidden pa-4">
    <!-- Fixed Search and Sort Controls -->
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

    <!-- Tabs Content (Handles its own scrolling) -->
    <div class="w-100 flex-grow-1 overflow-hidden d-flex flex-column">
      <MoleculesMedicationTabs
          v-model="tab"
          :view-type="viewType"
          :all-medication="allMedication"
          :valid-medication="validMedication"
          :expired-medication="expiredMedication"
          :increment-pills="incrementPills"
          :decrement-pills="decrementPills"
          :delete-pills="deletePills"
          :update-medication-name="updateMedicationName"
      />
    </div>

    <!-- Skeleton Loader Overlay -->
    <v-sheet v-if="medicationLoading"
             width="100%"
             height="100%"
             class="position-absolute top-0 left-0 d-flex align-center justify-center bg-surface opacity-80"
             style="z-index: 5;">
      <v-row class="d-flex align-start justify-start pa-4 w-100 h-100">
        <v-col v-for="i in 8" :key="i" md="3" cols="6">
          <AtomsLoadingMed/>
        </v-col>
      </v-row>
    </v-sheet>

    <v-speed-dial
        v-model="isDialOpen"
        location="bottom end"
        transition="slide-y-reverse-transition"
        class="mb-4 mr-4"
    >
      <template v-slot:activator="{ props: activatorProps }">
        <v-fab
            v-bind="activatorProps"
            color="primary"
            size="x-large"
            app
            :icon="isDialOpen ?  'mdi-close' : 'mdi-plus'"
            location="bottom end"
            :extended="!$device.isMobile"
            :text="!$device.isMobile ? t('add-pill') : ''"
            class="mb-4 mr-4"
        />
      </template>

      <v-btn
          key="1"
          color="secondary"
          prepend-icon="mdi-pill"
          class="text-capitalize font-weight-bold"
          rounded="lg"
          size="large"
          @click="openAddMedicationDialog"
      >
        {{ t('actions.addMedication') }}
      </v-btn>

      <v-btn
          key="2"
          color="primary"
          prepend-icon="mdi-alarm-plus"
          class="text-capitalize font-weight-bold"
          rounded="lg"
          size="large"
          @click="openReminderDialog"
      >
        {{ t('actions.createReminder') }}
      </v-btn>
    </v-speed-dial>
  </v-sheet>
</template>
<script setup lang="ts">
import type {Medication} from "~/types/medication";
import {useI18n} from "vue-i18n";
import CreateMedicationDialog from "~/components/molecules/createMedicationDialog.vue";
import {openToast, type ToastType} from "~/composables/openToast";
import {getCurrentUser} from "vuefire";
import ReminderCreationDialog from "~/components/molecules/ReminderCreationDialog.vue";
import type {CreateReminderRequest} from "~/types/reminder";
import {useCountryStore} from "~/store/country";

const {t} = useI18n()
const {$open, $device} = useNuxtApp()
const {selectedCountry} = storeToRefs(useCountryStore())
const searchQuery = ref('')
const viewType = ref<'grid' | 'table'>('grid')
const sortBy = ref<'name' | 'expiryDate' | 'quantity' | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')
const sortOptions = [
  {value: 'name' as const, label: 'sort.name', icon: 'mdi-alphabetical'},
  {value: 'expiryDate' as const, label: 'sort.expiryDate', icon: 'mdi-calendar-clock'},
  {value: 'quantity' as const, label: 'sort.quantity', icon: 'mdi-counter'}
]
const isDialOpen = ref(false);
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
      case 'expiryDate':
        // Handle Firestore Timestamp objects, Date objects, and date strings
      {
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
      }
      case 'quantity':
        comparison = a.quantity - b.quantity
        break
    }

    return sortOrder.value === 'asc' ? comparison : -comparison
  })
}

const props = defineProps<{
  medications: Medication[] | undefined
  createMedication: (medication: Medication) => Promise<void>
  incrementPills: (medication: Medication) => Promise<void>
  decrementPills: (medication: Medication) => Promise<void>
  deletePills: (medication: Medication) => Promise<void>
  updateMedicationName: (medication: Medication, newName: string) => Promise<void>
  medicationLoading: boolean
  createReminder: (createReminderRequest: CreateReminderRequest) => Promise<void>
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

const allMedication = computed(() => {
  const filtered = props.medications ?? []
  const searched = !searchQuery.value
      ? filtered
      : filtered.filter(med => med.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  return sortMedications(searched)
})

// Tab Logic
const tab = ref<string>('all')

const openAddMedicationDialog = async () => {
  const user = await getCurrentUser()
  const toastType = await $open<ToastType>(CreateMedicationDialog, {
    scrim: true,
    isPersistent: true,
    createMedication: props.createMedication,
    userUid: user?.uid,
    email: user?.email,
    medications: props.medications,
    selectedCountry: selectedCountry.value,
  })
  if (toastType !== 'canceled') openToast(toastType, t(toastType))
}

const openReminderDialog = async () => {
  const toastType = await $open<ToastType>(ReminderCreationDialog, {
    scrim: true,
    isPersistent: true,
    createReminder: props.createReminder,
    validMedications: validMedication.value
  })
  if (toastType !== 'canceled') openToast(toastType, t(`reminderDialog.toast.${toastType}`))
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

</style>