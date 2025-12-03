<template>
  <v-sheet width="100%" v-if="medications?.length ?? 0 > 0">
    <AtomsTitle :title="title" class="my-4"/>
    <v-row class="d-flex align-stretch justify-start">
      <v-col
          md="3"
          cols="6"
          v-for="medication in meds"
          :key="medication.medicationId"
      >
        <AtomsPill
            :is-expired="isExpired"
            :medication="medication"
            :decrement-pills="decrementPills"
            :increment-pills="incrementPills"
            :delete-pills="deletePills"
            :update-medication-name="updateMedicationName"
        />
      </v-col>
      <v-col cols="6" md="3" v-if="!showAll && rest">
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
const {$device} = useNuxtApp()

const {isExpired, medications, incrementPills, decrementPills, deletePills, updateMedicationName, hasBothCategories = false} = defineProps<{
  isExpired: boolean
  medications: Medication[] | undefined
  incrementPills: (medication: Medication) => Promise<void>
  decrementPills: (medication: Medication) => Promise<void>
  deletePills: (medication: Medication) => Promise<void>
  updateMedicationName: (medication: Medication, newName: string) => Promise<void>
  hasBothCategories?: boolean
}>()

const title = computed(() => (isExpired ? t('meds.expired') : t('meds.valid')))
const showAll = ref(false)

const meds = computed(() => {
  // When both categories are showing, use smaller limits
  // When only one category is showing, use larger limits
  const limit = hasBothCategories 
    ? ($device.isDesktop ? 7 : 3)
    : ($device.isDesktop ? 11 : 7)
  return showAll.value ? medications : medications?.slice(0, limit)
})

const rest = computed(() => (medications?.length ?? 0) - (meds.value?.length ?? 0))

const showRest = () => {
  showAll.value = true
}
</script>
