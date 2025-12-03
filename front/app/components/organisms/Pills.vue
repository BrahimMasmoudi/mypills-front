<template>
  <v-sheet width="100%"
           class="d-flex flex-column align-start fill-height pa-4">
    <!-- Desktop Header -->
    <div v-if="$device.isDesktop" class="w-100 mb-8 d-flex justify-center align-center position-relative">
      <v-text-field
          v-model="searchQuery"
          :label="t('search')"
          variant="solo"
          density="comfortable"
          hide-details
          rounded="pill"
          class="search-field-centered"
          style="max-width: 500px;"
      >
        <template #prepend-inner>
          <v-icon icon="mdi-magnify" color="primary"/>
        </template>
      </v-text-field>
      
      <v-btn
          color="primary"
          size="x-large"
          variant="elevated"
          rounded="pill"
          class="add-pill-btn-floating ml-4"
          @click="openDialog"
      >
        <v-icon icon="mdi-plus" class="mr-2"/>
        {{ t('add-pill') }}
      </v-btn>
    </div>

    <!-- Mobile Header -->
    <div v-else class="w-100 mb-4">
      <v-text-field
          v-model="searchQuery"
          :label="t('search')"
          variant="solo"
          density="comfortable"
          hide-details
          rounded="pill"
          class="search-field-mobile"
      >
        <template #prepend-inner>
          <v-icon icon="mdi-magnify" color="primary"/>
        </template>
      </v-text-field>
    </div>
    <MoleculesPills
        v-if="medications && (filter === 'valid' || (filter === 'all' && (validMedication.length > 0 || expiredMedication.length === 0)))"
        :is-expired="false"
        name="valide pills"
        :medications="validMedication"
        :has-both-categories="filter === 'all' && validMedication.length > 0 && expiredMedication.length > 0"
        :decrement-pills="decrementPills"
        :increment-pills="incrementPills"
        :delete-pills="deletePills"
        :update-medication-name="updateMedicationName"/>
    <MoleculesPills
        v-if="medications && (filter === 'expired' || (filter === 'all' && expiredMedication.length > 0))"
        :is-expired="true"
        name="expired pills"
        :medications="expiredMedication"
        :has-both-categories="filter === 'all' && validMedication.length > 0 && expiredMedication.length > 0"
        :decrement-pills="decrementPills"
        :increment-pills="incrementPills"
        :delete-pills="deletePills"
        :update-medication-name="updateMedicationName"/>

    <v-fab
        v-if="$device.isMobile"
        color="primary"
        icon="mdi-plus"
        size="x-large"
        location="bottom end"
        app
        @click="openDialog"
    />

    <v-sheet width="100%" v-if="medicationLoading">
       <v-row class="d-flex align-start justify-start my-3">
        <v-col v-for="i in 8"
               :key="i"
               md="3"
               cols="6">
          <AtomsLoadingMed/>
        </v-col>
      </v-row>
    </v-sheet>

    <v-sheet width="100%" height="100%" v-else-if="!medications || medications.length === 0"
           class="d-flex flex-column align-center justify-center font-weight-bold">
    <v-img :src="useAsset('/assets/img/no-result.svg')" max-height="400" width="400"/>
    {{ t('meds.no-result') }}
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
const {$open} = useNuxtApp()
const searchQuery = ref('')

const {medications, createMedication, incrementPills, decrementPills, deletePills, updateMedicationName, medicationLoading} = defineProps<{
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
  const filtered = medications?.filter((med: Medication) => !med.expired) ?? []
  if (!searchQuery.value) return filtered
  return filtered.filter(med => med.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})
const expiredMedication = computed(() => {
  const filtered = medications?.filter((med: Medication) => med.expired) ?? []
  if (!searchQuery.value) return filtered
  return filtered.filter(med => med.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})


const openDialog = async () => {
  const user = await getCurrentUser()

  const toastType = await $open<ToastType>(Dialog, {
    scrim: true,
    isPersistent: true,
    createMedication,
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
</style>