<template>
  <OrganismsPills :filter="filter" :medications="medications"/>
</template>
<script setup lang="ts">
import type {Filter} from "~/types/Filter";
import type {Medication} from "~/types/medications";

defineProps<{
  filter : Filter
  medications: Medication[]
}>()
</script>

<style scoped>

</style>