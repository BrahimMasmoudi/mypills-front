<template>
  <NuxtLayout >
    <NuxtLoadingIndicator color="primary"/>
    <NuxtPwaManifest />
    <NuxtPage/>
    <v-snackbar
        v-model="snackbarStore.show"
        :color="snackbarStore.color"
        location="top right"
        timeout="5000"
        elevation="4"
    >
      <div class="d-flex flex-column">
        <strong class="text-subtitle-1">{{ snackbarStore.title }}</strong>
        <span>{{ snackbarStore.text }}</span>
      </div>

      <template v-slot:actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbarStore.show = false"></v-btn>
      </template>
    </v-snackbar>
  </NuxtLayout>
</template>
<script setup lang="ts">
import {useSnackbarStore} from "~/store/snackbarStore";

const snackbarStore = useSnackbarStore()
</script>