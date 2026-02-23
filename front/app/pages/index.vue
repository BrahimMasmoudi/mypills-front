<template>
  <v-sheet
    width="100%"
    height="calc(100vh - 64px)"
    class="d-flex flex-column align-start mb-2 overflow-hidden pa-4"
  />
</template>

<script setup lang="ts">
onMounted(() => {
  navigateTo('/medications')
})
</script>

<style scoped>

</style>