<template>
  <v-text-field v-model="name"
                variant="outlined"
                hide-details
                :type="type"
                :label="label"/>
</template>
<script setup lang="ts">
const name = defineModel()
defineProps<{
  label: string
  type: string
}>()
</script>


<style scoped>

</style>