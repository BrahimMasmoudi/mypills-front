<template>
  <v-card
      elevation="2"
      color="primary"
      style="cursor: pointer"
      class="d-flex flex-column align-center justify-center position-relative px-4 pt-7 pb-11"
      height="165px">
    <span class="font-weight-bold text-h2">
     +{{ rest }}
    </span>
  </v-card>

</template>
<script setup lang="ts">
defineProps<{
  rest: number
}>()
</script>


<style scoped>

</style>