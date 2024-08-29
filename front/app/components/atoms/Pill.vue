<template>
  <v-card variant="outlined"
          :color="isExpired ? 'red' : ''"
          class="d-flex flex-column align-center justify-center position-relative px-4 py-7"
          height="155px">
    {{medication.name}}
  </v-card>
</template>
<script setup lang="ts">
import type {Medication} from "~/types/medications";

defineProps<{
  medication : Medication
  isExpired : boolean
}>()

</script>

<style scoped>

</style>