<template>
  <OrganismsPills :filter="filter"/>
</template>
<script setup lang="ts">
import type {Filter} from "~/types/Filter";

defineProps<{
  filter : Filter
}>()
</script>

<style scoped>

</style>