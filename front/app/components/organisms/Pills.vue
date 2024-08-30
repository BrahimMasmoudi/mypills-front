<template>
  <v-sheet width="100%" class="d-flex flex-column align-start justify-start fill-height pa-4" v-if="medications">
    <v-btn color="primary" position="absolute" location="right end" class="mr-5" @click="openDialog">
      <template #prepend>
        <nuxt-icon name="add"/>
      </template>
      <span class="create-title">
        {{ t('add-pill') }}
      </span>
    </v-btn>
    <MoleculesPills
        v-if="filter === 'all' || filter === 'valid'"
        :is-expired="false"
        name="Pill"
        :medications="validMedication"
    />
    <MoleculesPills
        v-if="filter === 'all' || filter === 'expired'"
        :is-expired="true"
        name="expired Pill"
        :medications="expiredMedication"
    />
  </v-sheet>

  <v-row v-else class="pa-4">
    <v-col v-for="i in 8"
           :key="i"
           cols="6"
           sm="6" md="6" lg="3">
      <AtomsLoadingMed/>
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
import type {Filter} from "~/types/Filter";
import type {Medication} from "~/types/medication";
import {useI18n} from "vue-i18n";
import Dialog from "~/components/molecules/Dialog.vue";
import {openToast, type ToastType} from "~/composables/openToast";

const {t} = useI18n()
const {$open} = useNuxtApp()

const {medications,createMedication} = defineProps<{
  filter: Filter
  medications: Medication[] | undefined
  createMedication: (medication: Medication) => Promise<void>
}>()

const validMedication = computed(() => medications.filter((med: Medication) => !med.expired) ?? [])
const expiredMedication = computed(() => medications.filter((med: Medication) => med.expired) ?? [])


const openDialog = async () => {
  const toastType = await $open<ToastType>(Dialog, {
    scrim: true,
    isPersistent: false,
    createMedication
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

v-btn >>> svg {
  width: 18px !important;
  height: 18px !important;
  margin-top: 2px;
}
</style>
<i18n>
fr:
  add-pill: Ajouter
  success: Le medicament est ajouté avec succss
  error: une erreur est survenue
en:
  add-pill: Create
  success: The pills are added successfully
  error: an error happened, please try again
</i18n>