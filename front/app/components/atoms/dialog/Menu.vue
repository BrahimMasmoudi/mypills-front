<template>
  <v-menu v-model="dateMenuIsOpen" :close-on-content-click="false" activator="parent"
          location="right center"
          z-index="9999"
          offset="10">
    <slot name="menu-details"/>
  </v-menu>
</template>
<script setup lang="ts">
const dateMenuIsOpen = defineModel()
</script>

<style scoped>

</style>