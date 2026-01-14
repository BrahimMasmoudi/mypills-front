<template>
  <v-menu location="bottom end" transition="slide-y-transition" :offset="8">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon :ripple="false" height="48">
        <v-avatar size="48" color="primary">
          <v-img v-if="userStore.user?.photoURL" :src="userStore.user.photoURL" cover/>
          <v-icon v-else icon="mdi-account" size="32" color="white"/>
        </v-avatar>
      </v-btn>
    </template>

    <v-card min-width="280" rounded="lg" elevation="4" class="mt-2 overflow-hidden">
      <div class="pa-4 d-flex align-center">
        <v-avatar size="36" class="mr-4" color="primary">
          <v-img v-if="userStore.user?.photoURL" :src="userStore.user.photoURL" cover/>
          <v-icon v-else icon="mdi-account" color="white"/>
        </v-avatar>
        <div class="d-flex flex-column overflow-hidden">
          <span class="text-subtitle-1 font-weight-bold text-truncate text-capitalize line-height-1">
            {{ userStore.user?.displayName }}
          </span>
          <span class="text-caption text-medium-emphasis text-truncate">
            {{ userStore.user?.email }}
          </span>
        </div>
      </div>

      <v-divider/>

      <v-list density="comfortable" nav class="pa-2">
        <v-list-item
            value="theme"
            rounded="lg"
            color="primary"
            @click="toggleColorMode"
            class="mb-1"
        >
          <template #prepend>
            <v-icon :color="colorMode.value === 'dark' ? 'amber' : 'black'">
              {{ colorMode.value === 'dark' ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}
            </v-icon>
          </template>
          <v-list-item-title class="font-weight-medium">
            {{ t('user-menu.change-theme') }}
          </v-list-item-title>
        </v-list-item>

        <v-menu location="bottom end" transition="slide-y-transition" :offset="8">
          <template v-slot:activator="{ props }">
            <v-list-item
                v-bind="props"
                value="change-language"
                rounded="lg"
                color="error"
            >
              <template #prepend>
                <v-icon icon="mdi-translate"/>
              </template>
              <v-list-item-title class="font-weight-medium">
                {{ t('user-menu.change-language') }}
              </v-list-item-title>
            </v-list-item>
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
                <nuxt-icon :name="`flag-${lang.code}`" filled class="flag-icon mr-3"/>
              </template>
              <v-list-item-title class="font-weight-medium">
                {{ lang.name }}
              </v-list-item-title>
            </v-list-item>
          </v-list>

        </v-menu>


        <v-list-item
            value="change-country"
            rounded="lg"
            color="error"
            @click="openCountryDialog"
        >
          <template #prepend>
            <v-icon icon="mdi-earth"/>
          </template>
          <v-list-item-title class="font-weight-medium d-flex align-center justify-space-between">
            {{ t('user-menu.change-country') }}
            <nuxt-icon v-if="selectedCountry === 'FR'" :name="`flag-${selectedCountry?.toLowerCase()}`" filled class="flag-icon-medium mr-3"/>
          </v-list-item-title>
        </v-list-item>

        <v-list-item
            value="disconnect"
            rounded="lg"
            @click="handleSignOut"
            color="error"
        >
          <template #prepend>
            <v-icon icon="mdi-logout" color="error"/>
          </template>
          <v-list-item-title>
            {{ t('user-menu.disconnect') }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import {useUserStore} from "~/store/userStore";
import {useI18n} from "vue-i18n";
import {useTheme} from 'vuetify'
import {useCountryStore} from "~/store/country";
import CountryDialog from "~/components/molecules/CountryDialog.vue";

const userStore = useUserStore()
const {t, locale} = useI18n()
const theme = useTheme()
const colorMode = useColorMode()
const {$open} = useNuxtApp()
const {confirmFrance, clearCountry} = useCountryStore()

const {selectedCountry} = storeToRefs(useCountryStore())

const handleSignOut = async () => {
  await userStore.logOut()
  navigateTo('/login')
}

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light'
}


const languages = [
  {code: 'en', name: 'English'},
  {code: 'fr', name: 'Français'}
]

const switchLocale = (newLocale: string) => {
  locale.value = newLocale
}
watch(() => colorMode.value, (val) => {
  theme.change(val)
}, {immediate: true})

const openCountryDialog = async () => {
  const result = await $open<string | null>(CountryDialog, {
    scrim: true,
    isPersistent: true
  })

  if (result === 'FR') {
    confirmFrance()
  } else {
    clearCountry()
  }
}
</script>

<style scoped>
.line-height-1 {
  line-height: 1;
}

.flag-icon :deep(svg) {
  width: 28px;
  height: 28px;
  margin-top: 2px;
  color: currentColor;
}

.flag-icon-medium :deep(svg) {
  width: 24px;
  height: 24px;
  margin-top: 2px;
  color: currentColor;
}
</style>
