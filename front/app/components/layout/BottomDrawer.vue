<template>
  <v-bottom-navigation
      grow
      color="primary"
      app
  >
    <v-btn to="/medications">
      <v-icon>mdi-pill</v-icon>
      <span>{{ t('nav.medications') }}</span>
    </v-btn>

    <v-btn to="/reminders">
      <v-icon>mdi-calendar-clock</v-icon>
      <span>{{ t('nav.reminders') }}</span>
    </v-btn>

    <v-btn to="/prescriptions">
      <v-icon>mdi-folder-upload-outline</v-icon>
      <span>{{ t('nav.prescriptions') }}</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";

const {t} = useI18n()
</script>

<style scoped>

</style>