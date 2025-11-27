<template>
  <v-card
      elevation="2"
      color="primary"
      style="cursor: pointer"
      v-bind="$attrs"
      class="d-flex flex-column align-center justify-center">
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