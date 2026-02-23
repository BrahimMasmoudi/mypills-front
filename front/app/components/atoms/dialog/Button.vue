<template>
  <v-btn
    variant="outlined"
    :ripple="false"
    style="border-radius: 4px !important; border: 1px solid gray;"
    height="56"
    width="100%"
    :loading="loading"
    class="d-flex align-center justify-space-between pl-2"
  >
    <template #default>
      <slot name="default"/>
      <slot name="menu"/>
    </template>
    <template #append>
      <slot name="append"/>
    </template>
  </v-btn>
</template>
<script setup lang="ts">
defineProps<{
  loading?: boolean
}>()
</script>


<style scoped>
.v-btn {
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Roboto, sans-serif;
  font-size: 1rem;
  font-style: normal;
  line-height: normal;
  letter-spacing: 0.27px;
}
</style>