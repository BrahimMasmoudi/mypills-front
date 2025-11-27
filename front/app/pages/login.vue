<template>
  <div class="login-container">
    <v-btn @click.prevent="login" class="login-button" height="50">
      <template #prepend>
        <nuxt-icon filled name="google"/>
      </template>
      {{ t('login.google') }}
    </v-btn>
  </div>
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
  navigateTo('/all')
}
</script>
<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  background-color: #3643BA;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
}

:deep(svg) {
  width: 24px !important;
  height: 24px !important;
}
</style>