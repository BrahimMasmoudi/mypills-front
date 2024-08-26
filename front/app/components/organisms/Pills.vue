<template>
  <v-container width="100%">
    <MoleculesPills
        v-if="filter === 'all' || filter === 'valid'"
        :is-expired="false"
        name="Pill"
    />
    <MoleculesPills
        v-if="filter === 'all' || filter === 'expired'"
        :is-expired="true"
        name="expired Pill"
    />
  </v-container>
</template>
<script setup lang="ts">
import type {Filter} from "~/types/Filter";

defineProps<{
  filter : Filter
}>()
</script>
<style scoped>

</style>