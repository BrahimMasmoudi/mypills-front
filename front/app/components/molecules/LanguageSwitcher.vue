<template>
  <v-menu location="bottom end" transition="slide-y-transition" :offset="8">
    <template v-slot:activator="{ props }">
      <v-btn
          v-bind="props"
          icon
          variant="text"
          :ripple="false"
          class="language-btn"
      >
        <nuxt-icon :name="currentLanguage" class="flag-icon" />
      </v-btn>
    </template>

    <v-list density="compact" rounded="lg" elevation="8" class="py-2" min-width="150">
      <v-list-item
          v-for="lang in languages"
          :key="lang.code"
          :value="lang.code"
          @click="switchLocale(lang.code)"
          :active="locale === lang.code"
          color="primary"
          rounded="lg"
          class="mb-1 mx-2"
      >
        <template #prepend>
          <nuxt-icon :name="`flag-${lang.code}`" filled class="flag-icon-small mr-3"/>
        </template>
        <v-list-item-title class="font-weight-medium">
          {{ lang.name }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' }
]

const currentLanguage = computed(() => {
  return locale.value === 'fr' ? 'fr' : 'en'
})

const switchLocale = (newLocale: string) => {
  locale.value = newLocale
}
</script>
<style scoped>
/* Ensure the activator icon matches the theme text color */
.flag-icon :deep(svg) {
  width: 32px;
  height: 32px;
  margin-top: 2px;
  /* Use currentColor so it changes automatically between black/white */
  color: currentColor;
}

.flag-icon-small :deep(svg) {
  width: 24px;
  height: 24px;
}

/* Optional: Add a subtle border to the menu in dark mode for better visibility */
:deep(.v-theme--dark.v-list) {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-btn--active.language-btn::before {
  opacity: 0 !important;
}

/* Specifically for Dark Mode visibility */
.dark-mode .language-btn {
  color: inherit; /* Keeps the icon's natural colors */
}

/* Remove the gray/white circle that appears on click/active */
.language-btn :deep(.v-btn__overlay) {
  background-color: transparent !important;
}
</style>