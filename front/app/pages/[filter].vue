<template>
  <TemplatesPills :filter="$route.params.filter as Filter" :medications="medications"
                  :create-medication="createMedication"/>
</template>
<script setup lang="ts">

import type {Filter} from "~/types/Filter";

import {useMedicationsStore} from "~/store/medications";
import type {Medication} from "~/types/medication";

const medicationStore = useMedicationsStore()
const {data: medications} = await useLazyAsyncData(() => medicationStore.getMedications())


const createMedication = async (medication: Medication) => {
  await medicationStore.createMedication(medication)
}

</script>

<style scoped>

</style>