<template>
  <v-card-title class="font-weight-bold pl-0">
    {{ title }}
  </v-card-title>
</template>
<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>


<style scoped>

</style>