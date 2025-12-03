<template>
  <v-card
      elevation="2"
      color="primary"
      style="cursor: pointer"
      v-bind="$attrs"
      rounded="lg"
      class="d-flex flex-column align-center justify-center fill-height">
    <span class="font-weight-bold" :class="$device.isMobile ? 'text-h4' : 'text-h2'">
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