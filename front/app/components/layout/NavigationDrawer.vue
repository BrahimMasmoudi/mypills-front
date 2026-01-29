<template>
  <v-navigation-drawer
      v-model="drawer"
      temporary
      close-delay="0"
      elevation="0"
      border="e"
  >
    <v-list nav class="pa-4">
      <v-list-item
          to="/medications"
          rounded="pill"
          class="mb-2 nav-pill"
          active-class="active-pill"
          link
      >
        <template #prepend>
          <v-icon icon="mdi-pill" size="20" class="ml-2 mr-n3"/>
        </template>

        <v-list-item-title class="font-weight-bold ml-4">
          {{ t('nav.medications') }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item
          to="/reminders"
          rounded="pill"
          class="mb-2 nav-pill"
          active-class="active-pill"
          link
      >
        <template #prepend>
          <v-icon icon="mdi-calendar-clock" size="20" class="ml-2 mr-n3"/>
        </template>

        <v-list-item-title class="font-weight-bold ml-4">
          {{ t('nav.reminders') }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item
          to="/prescriptions"
          rounded="pill"
          class="mb-2 nav-pill"
          active-class="active-pill"
          link
      >
        <template #prepend>
          <v-icon icon="mdi-folder-upload-outline" size="20" class="ml-2 mr-n3"/>
        </template>

        <v-list-item-title class="font-weight-bold ml-4">
          {{ t('nav.prescriptions') }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
<script setup lang="ts">
import {useI18n} from "vue-i18n"

const drawer = defineModel<boolean>()
const {t} = useI18n()
</script>
<style scoped>
/* Base Pill Style */
.nav-pill {
  transition: all 0.2s ease-in-out;
  color: rgba(var(--v-theme-on-surface), 0.6);
  min-height: 44px !important;
}

/* Active Pill Style */
.active-pill {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
  box-shadow: 0 4px 10px rgba(var(--v-theme-primary), 0.3);
}

/* Ensure icons turn white in the active pill */
.active-pill :deep(.v-icon) {
  color: white !important;
}

/* Reduce the gap specifically between the prepend slot and content */
:deep(.v-list-item__spacer) {
  width: 12px !important; /* Adjust this value to bring icon/text closer */
}
</style>