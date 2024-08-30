<template>
  <OrganismsPills :filter="filter" :medications="medications" :create-medication="createMedication"/>
</template>
<script setup lang="ts">
import type {Filter} from "~/types/Filter";
import type {Medication} from "~/types/medication";

defineProps<{
  filter : Filter
  medications: Medication[] | undefined
  createMedication: (medication: Medication) => Promise<void>
}>()
</script>

<style scoped>

</style>