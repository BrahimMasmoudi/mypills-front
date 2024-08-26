<template>
  <v-sheet>
    <AtomsTitle :title="title"/>
    <v-row class="d-flex align-start justify-start my-3">
      <v-col cols="3" v-for="i in 6"
             :key="i">
        <AtomsPill :name="name" :is-expired="isExpired"/>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";

const {t} = useI18n()
const {isExpired} = defineProps<{
  isExpired: boolean
  name: string
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