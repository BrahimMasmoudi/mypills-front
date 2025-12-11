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

const userStore = useUserStore()
const {t} = useI18n()
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
</style>