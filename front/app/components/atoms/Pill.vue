<template>
  <v-card
      :color="isExpired ? '#FF000090' : ''"
      elevation="2"
      class="d-flex flex-column align-center justify-center position-relative px-4 py-7"
      height="155px">
    <nuxt-icon filled :name="medication.image" class="mb-2"/>
    <span class="font-weight-bold">
      {{ medication.name }}
    </span>

    <v-badge color="red" offset-x="-130" offset-y="-85" style="min-height: 12px;">
      <template #badge>
        {{ medication.quantity }}
      </template>
    </v-badge>
    {{parseDate(medication.expiryDate)}}
  </v-card>
</template>
<script setup lang="ts">
import type {Medication} from "~/types/medication";
import {parseDate} from "~/composables/parseDate";

defineProps<{
  medication: Medication
  isExpired: boolean
}>()

</script>

<style scoped>
>>> svg {
  width: 48px !important;
  height: 48px !important;
}
</style>