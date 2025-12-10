<template>
  <v-app>
    <!-- Navbar -->
    <v-app-bar elevation="0" color="transparent">
      <v-toolbar-title class="text-h6 font-weight-bold d-flex align-center text-white">
        <nuxt-icon filled name="application-icon" class="app-icon-nav"/>
        MyPills
      </v-toolbar-title>
      <v-spacer/>
    </v-app-bar>

    <!-- Hero Section -->
    <v-main class="landing-page">
      <v-container fluid class="fill-height">
        <v-row class="fill-height align-center justify-center">
          <!-- Desktop Layout -->
          <v-col v-if="$device.isDesktop" cols="12" class="d-flex align-center justify-center">
            <v-row class="align-center justify-center" style="max-width: 1200px;">
              <!-- Left Side - Illustration -->
              <v-col cols="12" md="6" class="d-flex flex-column align-center justify-center">
                <div class="illustration-container">
                  <div class="pill-icon-large">
                    <nuxt-icon filled name="application-icon" class="icon-3d"/>
                  </div>
                </div>
              </v-col>

              <!-- Right Side - Sign In -->
              <v-col cols="12" md="6">
                <v-card class="signin-card elevation-12 rounded-xl pa-8" max-width="500">
                  <h1 class="text-h4 font-weight-bold mb-4 text-gradient">
                    {{ t('landing.welcome') }}
                  </h1>
                  <p class="text-h6 text-medium-emphasis mb-2">
                    {{ t('landing.subtitle') }}
                  </p>

                  <!-- Features List -->
                  <v-list class="bg-transparent mb-4">
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon color="primary" size="24">mdi-bell-ring</v-icon>
                      </template>
                      <v-list-item-title class="text-body-1">{{ t('landing.features.expiry') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon color="primary" size="24">mdi-pill</v-icon>
                      </template>
                      <v-list-item-title class="text-body-1">{{ t('landing.features.inventory') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon color="primary" size="24">mdi-cloud-sync</v-icon>
                      </template>
                      <v-list-item-title class="text-body-1">{{ t('landing.features.access') }}</v-list-item-title>
                    </v-list-item>
                  </v-list>

                  <!-- CTA Button -->
                  <v-btn
                      @click.prevent="login"
                      color="primary"
                      size="x-large"
                      variant="flat"
                      block
                      class="text-none font-weight-bold mb-4 google-btn"
                      rounded="lg"
                      :loading="isLoading"
                      :disabled="isLoading"
                  >
                    <template #prepend>
                      <nuxt-icon filled name="google" class="mr-2"/>
                    </template>
                    {{ t('login.google') }}
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-col>

          <!-- Mobile Layout -->
          <v-col v-else cols="12" class="d-flex flex-column align-center justify-center px-4">
            <!-- Mobile Illustration -->
            <div class="illustration-container-mobile mb-8">
              <div class="pill-icon-mobile">
                <nuxt-icon filled name="application-icon" class="icon-3d-mobile"/>
              </div>
            </div>

            <!-- Mobile Sign In Card -->
            <v-card class="signin-card-mobile elevation-12 rounded-xl pa-6" width="100%" max-width="400">
              <h1 class="text-h4 font-weight-bold mb-3 text-gradient text-center">
               {{ t('landing.welcome') }}
              </h1>
              <p class="text-body-1 text-medium-emphasis mb-5 text-center">
                {{ t('landing.subtitle') }}
              </p>

              <!-- Features List -->
              <v-list class="bg-transparent mb-5" density="compact">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="primary" size="20">mdi-bell-ring</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">{{ t('landing.features.expiry') }}</v-list-item-title>
                </v-list-item>
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="primary" size="20">mdi-pill</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">{{ t('landing.features.inventory') }}</v-list-item-title>
                </v-list-item>
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="primary" size="20">mdi-cloud-sync</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">{{ t('landing.features.access') }}</v-list-item-title>
                </v-list-item>
              </v-list>

              <!-- CTA Button -->
              <v-btn
                  @click.prevent="login"
                  color="primary"
                  size="large"
                  variant="flat"
                  block
                  class="text-none font-weight-bold mb-3 google-btn"
                  rounded="lg"
                  :loading="isLoading"
                  :disabled="isLoading"
              >
                <template #prepend>
                  <nuxt-icon filled name="google" class="mr-2"/>
                </template>
                {{ t('login.google') }}
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-overlay
        :model-value="isLoading"
        class="align-center justify-center"
        persistent
        z-index="2000"
    >
      <div class="d-flex flex-column align-center">
        <v-progress-circular indeterminate color="white" size="64"></v-progress-circular>
        <div class="mt-4 font-weight-bold text-white text-h6">{{ t('login.completing') }}</div>
      </div>
    </v-overlay>
  </v-app>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import {useUserStore} from "~/store/userStore";

const userStore = useUserStore()
const {$device} = useNuxtApp()
const {t} = useI18n()

definePageMeta({
  layout: false,
})

const isLoading = ref(false)

if (userStore.user) navigateTo('/all')

const login = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await userStore.login()
    await navigateTo('/all')
  } catch (e) {
    console.error('Login failed', e)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.landing-page {
background: url('~/assets/img/background.png') no-repeat center center;
background-size: cover;
  min-height: 100vh;
}

.landing-page::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(103, 126, 234, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.app-icon-nav >>> svg {
  width: 32px !important;
  height: 32px !important;
}

.signin-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.signin-card-mobile {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 3D Illustration Styles */
.illustration-container {
  position: relative;
  width: 400px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration-container-mobile {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.floating-shape-mobile {
  position: absolute;
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, rgba(103, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, rgba(118, 75, 162, 0.2) 0%, rgba(103, 126, 234, 0.2) 100%);
  bottom: 20%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(103, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%);
  top: 50%;
  right: 5%;
  animation-delay: 4s;
}

.pill-icon-large {
  position: relative;
  z-index: 10;
  animation: float 4s ease-in-out infinite;
  filter: drop-shadow(0 10px 30px rgba(103, 126, 234, 0.3));
}

.pill-icon-mobile {
  position: relative;
  z-index: 10;
  animation: float 4s ease-in-out infinite;
  filter: drop-shadow(0 5px 15px rgba(103, 126, 234, 0.3));
}

.icon-3d >>> svg {
  width: 200px !important;
  height: 200px !important;
}

.icon-3d-mobile >>> svg {
  width: 120px !important;
  height: 120px !important;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Google icon sizing */
:deep(.google-btn svg) {
  width: 24px !important;
  height: 24px !important;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .text-gradient {
    font-size: 1.75rem !important;
  }
}
</style>