<template>
  <v-sheet width="100%" class="d-flex flex-column align-start justify-start fill-height pa-4" v-if="medications">
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
import type {Medication} from "~/types/medications";

const {medications} = defineProps<{
  filter: Filter
  medications: Medication[]
}>()

const validMedication = computed(() => medications.filter((med: Medication) => !med.expired) ?? [])
const expiredMedication = computed(() => medications.filter((med: Medication) => med.expired) ?? [])
</script>
<style scoped>

</style>
