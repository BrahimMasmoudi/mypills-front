<template>
  <TemplatesPills :filter="$route.params.filter as Filter"
                  :medications="medications"
                  :decrement-pills="decrementPills"
                  :increment-pills="incrementPills"
                  :delete-pills="deletePills"
                  :create-medication="createMedication"/>
</template>
<script setup lang="ts">

import type {Filter} from "~/types/Filter";

import {useMedicationsStore} from "~/store/medications";
import type {Medication} from "~/types/medication";

const medicationStore = useMedicationsStore()
const medications = medicationStore.getMedications()

const createMedication = async (medication: Medication) => {
  await medicationStore.createMedication(medication)
}

const incrementPills = async (medication: Medication) => {
  await medicationStore.incrementPills(medication)
}
const decrementPills = async (medication: Medication) => {
  await medicationStore.decrementPills(medication)
}
const deletePills = async (medication: Medication) => {
  await medicationStore.deletePills(medication)
}

</script>

<style scoped>

</style>