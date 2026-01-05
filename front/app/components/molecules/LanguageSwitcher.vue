<template>
  <v-menu location="bottom end" transition="slide-y-transition" :offset="8">
    <template v-slot:activator="{ props }">
      <v-btn
          v-bind="props"
          icon
      >
        <v-avatar size="32">
       <nuxt-icon :name="currentLanguage" class="flag-icon text-black" />
        </v-avatar>
      </v-btn>
    </template>
    
    <v-list density="compact" rounded="lg" elevation="4" class="py-2" min-width="150">
      <v-list-item
          value="en"
          @click="switchLocale('en')"
          :active="locale === 'en'"
          color="primary"
          rounded="lg"
          class="mb-1 mx-2"
      >
        <template #prepend>
          <nuxt-icon name="flag-en" filled class="flag-icon-small mr-3" />
        </template>
        <v-list-item-title class="font-weight-medium">English</v-list-item-title>
      </v-list-item>
      
      <v-list-item
          value="fr"
          @click="switchLocale('fr')"
          :active="locale === 'fr'"
          color="primary"
          rounded="lg"
          class="mx-2"
      >
        <template #prepend>
          <nuxt-icon name="flag-fr" filled class="flag-icon-small mr-3" />
        </template>
        <v-list-item-title class="font-weight-medium">Français</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const currentLanguage = computed(() => {
  return locale.value === 'fr' ? 'fr' : 'en'
})

const switchLocale = (newLocale: string) => {
  locale.value = newLocale
}
</script>

<style scoped>
.flag-icon :deep(svg) {
  width: 32px;
  height: 32px;
  margin-top: 2px;
}

.flag-icon-small :deep(svg) {
  width: 24px;
  height: 24px;
}
</style>
