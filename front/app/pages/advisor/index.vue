<template>
  <MoleculesMedicationsMedicationAdvisor />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
useSeoMeta({
  title: () => t('medicationAdvisor.title')
})
</script>
