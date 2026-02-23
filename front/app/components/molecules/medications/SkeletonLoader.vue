<template>
  <div class="h-100 overflow-hidden pa-4">
    <v-sheet class="bg-transparent">
      <v-skeleton-loader
        type="text"
        class="bg-transparent"
        width="350"
      />
    </v-sheet>

    <v-sheet class="d-flex justify-center mb-6 bg-transparent">
      <v-skeleton-loader
        type="chip, chip, chip"
        class="bg-transparent"
        width="400"
      />
    </v-sheet>

    <v-row>
      <v-col
        v-for="i in 8"
        :key="i"
        cols="6"
        sm="6"
        md="4"
        lg="3"
      >
        <v-skeleton-loader
          elevation="2"
          class="rounded-xl"
          :type="$device.isDesktop ? 'image, list-item-two-line, actions' : 'card'"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
</script>
<style scoped>
div:deep(.v-skeleton-loader__image) {
  border-radius: 25px 25px 0 0;
}
</style>