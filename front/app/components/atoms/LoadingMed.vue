<template>
  <v-card
    variant="outlined"
    width="100%"
    color="#EEE"
    class="d-flex flex-column align-center justify-center px-4"
    height="250px"
  >
    <v-skeleton-loader
      width="70%"
      height="20px"
      type="heading"
      class="mb-4"
    />
    <v-skeleton-loader
      width="70%"
      height="20px"
      type="heading"
      class="mb-4"
    />
    <v-skeleton-loader
      width="50%"
      height="20px"
      type="chip"
      color="transparent"
    />
  </v-card>
</template>
<script setup lang="ts">

</script>

<style scoped>
.v-skeleton-loader:deep(.v-skeleton-loader__heading) {
  margin-top: 0;
}

.v-skeleton-loader:deep(.v-skeleton-loader__chip) {
  margin-top: 5px;
  margin-left: auto;
  margin-right: auto;
}

</style>