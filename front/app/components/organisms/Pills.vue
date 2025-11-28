<template>
  <v-sheet width="100%"
           class="d-flex flex-column align-start fill-height pa-4">
    <v-btn v-if="$device.isDesktop" color="primary" position="absolute" location="right end" class="mr-5 mt-2" @click="openDialog">
      <template #prepend>
        <nuxt-icon name="add"/>
      </template>
      <span class="create-title">
        {{ t('add-pill') }}
      </span>
    </v-btn>
    <div class="w-100">
      <v-text-field
          v-model="searchQuery"
          :label="t('search')"
          variant="outlined"
          :width="$device.isMobile ? '100%' : '25%'"
          hide-details
      >
        <template #append-inner>
          <v-icon icon="mdi-magnify"/>
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
  openToast(toastType, t(toastType))
}
</script>
<style scoped>
.create-title {
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Roboto, sans-serif;
  font-size: 1rem;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 0.27px;
}

v-btn :deep(svg) {
  width: 18px !important;
  height: 18px !important;
  margin-top: 2px;
}
</style>