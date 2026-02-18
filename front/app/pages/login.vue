<template>
  <v-app>
    <!-- Desktop View -->
    <TemplatesLoginDesktop 
      v-if="$device.isDesktop" 
      :is-loading="isLoading"
      @login="login"
    />

    <!-- Mobile View -->
    <TemplatesLoginMobile 
      v-else 
      :is-loading="isLoading"
      @login="login"
    />

    <!-- Global Loading Overlay (Backup) -->
    <v-overlay
        :model-value="isLoading"
        class="align-center justify-center backdrop-blur"
        persistent
        z-index="2000"
    >
      <v-card class="pa-8 d-flex flex-column align-center rounded-xl elevation-24 bg-surface" min-width="200">
         <v-progress-circular indeterminate color="primary" size="48" class="mb-4"/>
         <span class="font-weight-bold text-primary">{{ t('login.completing') }}</span>
      </v-card>
    </v-overlay>
  </v-app>
</template>

<script lang="ts" setup>
import {useUserStore} from "~/store/userStore"
import {useI18n} from "vue-i18n"


const userStore = useUserStore()
const { t } = useI18n()

definePageMeta({
  layout: false,
})

const isLoading = ref(false)

if (userStore.user) navigateTo('/medications')

const login = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await userStore.login()
    await navigateTo('/medications')
  } catch (e) {
    console.error('Login failed', e)
    isLoading.value = false
  }
}
</script>

<style scoped>
.backdrop-blur { backdrop-filter: blur(5px); }
</style>