<template>
  <v-sheet width="100%" v-if="medications?.length > 0">
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
      <v-col cols="3" v-if="!showAll && rest">
        <MoleculesShowMorePills :rest="rest" @click="showRest"/>
      </v-col>
    </v-row>
  </v-sheet>

  <v-sheet width="100%" height="100%" v-else
           class="d-flex flex-column align-center font-weight-bold">
    <v-img :src="useAsset('/assets/img/no-result.png')" max-height="400" width="400"/>
    {{ t('no-result') }}
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

const meds = computed(() => showAll.value ? medications : medications?.slice(0, 7))

const rest = computed(() => (medications?.length ?? 0) - (meds.value?.length ?? 0))

const showRest = () => {
  showAll.value = true
}
</script>
