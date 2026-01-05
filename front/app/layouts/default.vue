<template>
  <v-app class="rounded rounded-md">
    <v-app-bar elevation="1">
      <template #title>
        <div class="d-flex align-center">
          <nuxt-icon name="application-icon" filled class="app-title-icon mr-1"/>
          <span class="app-title-text">{{ t('title') }}</span>
        </div>
      </template>
      <div v-if="userStore.user" class="mr-2 d-flex align-center">
        <MoleculesLanguageSwitcher />
        <v-btn icon @click="openCountryDialog">
          <v-avatar size="28">
            <nuxt-icon :name="`flag-${selectedCountry.toLocaleLowerCase()}`" filled class="flag-icon"/>
          </v-avatar>
        </v-btn>
        <MoleculesUserMenu />
      </div>
    </v-app-bar>
    <v-main>
      <slot/>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import {useUserStore} from "~/store/userStore";
import MoleculesLanguageSwitcher from "~/components/molecules/LanguageSwitcher.vue";
import MoleculesUserMenu from "~/components/molecules/UserMenu.vue";
import {useCountryStore} from "~/store/country";
import CountryDialog from "~/components/molecules/CountryDialog.vue";

const userStore = useUserStore()
const {t} = useI18n()
const {$open} = useNuxtApp()
const {confirmFrance,clearCountry} = useCountryStore()
const {selectedCountry} = storeToRefs(useCountryStore())

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
.app-title-text {
  font-family: 'Roboto', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #1a1a1a;
}

.app-title-icon {
  font-size: 1.75rem;
  color: #3643BA;
}

.app-title-icon :deep(svg) {
  width: 28px !important;
  height: 28px !important;
}

.flag-icon :deep(svg) {
  width: 32px;
  height: 32px;
  margin-top: 2px;
}
</style>