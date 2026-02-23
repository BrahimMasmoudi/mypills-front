<template>
  <v-sheet class="bg-transparent mb-4">
    <v-skeleton-loader
      type="text"
      class="bg-transparent"
      width="350"
    />
    <v-skeleton-loader
      type="text"
      class="bg-transparent"
      width="250"
    />
  </v-sheet>

  <v-row>
    <v-col
      v-for="i in 8"
      :key="i"
      cols="12"
      :class="$device.isMobile ? 'px-10' : ''"
      md="4"
      lg="3"
    >
      <v-skeleton-loader
        elevation="2"
        class="rounded-xl"
        type="card"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
</script>
<style scoped>
div:deep(.v-skeleton-loader__image) {
  border-radius: 25px 25px 0 0;
}
</style>