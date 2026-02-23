<template>
  <v-text-field
    v-model="name"
    variant="outlined"
    hide-details
    :type="type"
    :label="label"
  />
</template>
<script setup lang="ts">
const name = defineModel<string>()
defineProps<{
  label: string
  type: string
}>()
</script>


<style scoped>

</style>