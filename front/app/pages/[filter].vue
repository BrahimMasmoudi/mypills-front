<template>
  <TemplatesPills :filter="$route.params.filter as Filter" :medications="medications"/>
</template>
<script setup lang="ts">

import type {Filter} from "~/types/Filter";

import {useMedicationsStore} from "~/store/medications";
const medicationStore = useMedicationsStore()
const {data : medications} = await useLazyAsyncData(() => medicationStore.getMedications())

</script>

<style scoped>

</style>