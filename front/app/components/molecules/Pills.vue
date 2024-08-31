<template>
  <v-sheet width="100%">
    <AtomsTitle :title="title"/>
    <v-row class="d-flex align-start justify-start my-3">
      <v-col
          cols="3"
          v-for="medication in meds"
          :key="medication.medicationId"
      >
        <AtomsPill
            :is-expired="isExpired"
            :medication="medication"
            :decrement-pills="decrementPills"
            :increment-pills="incrementPills"
            :delete-pills="deletePills"
        />
      </v-col>
      <v-col cols="3" v-if="!showAll">
        <MoleculesShowMorePills :rest="rest" @click="showRest"/>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import {useI18n} from 'vue-i18n'
import type {Medication} from '~/types/medication'

const {t} = useI18n()

const {isExpired, medications, incrementPills, decrementPills, deletePills} = defineProps<{
  isExpired: boolean
  medications: Medication[] | undefined
  incrementPills: (medication: Medication) => Promise<void>
  decrementPills: (medication: Medication) => Promise<void>
  deletePills: (medication: Medication) => Promise<void>
}>()

const title = computed(() => (isExpired ? t('expired') : t('valid')))
const showAll = ref(false)

const meds = computed(() => showAll.value ? medications : useSlice(medications, 0, 7))

const rest = computed(() => (medications?.length ?? 0) - (meds.value?.length ?? 0))

const showRest = () => {
  showAll.value = true
}
</script>

<style scoped>
/* Add your styles here */
</style>

<i18n>
fr:
  expired: Medicaments expirés
  valid: Medicaments valides
en:
  expired: Expired meds
  valid: Valid meds
</i18n>
