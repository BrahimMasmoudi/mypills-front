<template>
  <v-img
      class="d-flex align-center justify-center"
      :src="getImageSrc('/assets/img/store-background.svg')"
      cover
      width="100%"
      height="100%"
      max-width="100%"
  >
    <div class="text-center">
      <v-btn @click.prevent="login" class="button" height="50">
        <template #prepend>
          <nuxt-icon filled name="google"/>
        </template>
        {{ t('login.google') }}
      </v-btn>
    </div>
  </v-img>
</template>
<script lang="ts" setup>

import {useUserStore} from "~/store/userStore";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const userStore = useUserStore()
definePageMeta({
  layout: false,
})
if (userStore.user) navigateTo('/all')

const login = async () => {
  await userStore.login()
  console.log('brahim', userStore.user)
  navigateTo('/all')
}

const getImageSrc = (iconUrl: string) => {
  return useAsset(iconUrl)
}
</script>
<style scoped>
:deep(svg) {
  width: 24px !important;
  height: 24px !important;
}
</style>