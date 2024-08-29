<template>
  <v-sheet width="100%">
    <AtomsTitle :title="title"/>
    <v-row class="d-flex align-start justify-start my-3">
      <v-col cols="3" v-for="medication in medications"
             :key="medication.medicationId">
        <AtomsPill :is-expired="isExpired" :medication="medication"/>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
import type {Medication} from "~/types/medications";

const {t} = useI18n()
const {isExpired} = defineProps<{
  isExpired: boolean
  medications : Medication[] | undefined
}>()

const title = computed(() => isExpired ? t('expired') : t('valid'))
</script>

<style scoped>

</style>


<i18n>
fr:
  expired: Medicaments expirés
  valid: Medicaments valides
en:
  expired: Expired meds
  valid: Valid meds
</i18n>