<template>
  <v-app class="landing-page bg-primary-light">
    <!-- Navbar -->
    <v-app-bar elevation="1" height="64" color="surface">
      <v-sheet class="d-flex align-center justify-space-between px-5" width="100%" color="transparent">
        <div class="d-flex align-center gap-3">
            <nuxt-icon filled name="application-icon" class="app-icon-nav"/>
          <span class="text-h5 font-weight-bold text-primary-darken-1 tracking-tight">
        MyPills
      </span>
        </div>
        <v-spacer/>

        <MoleculesThemeSwitcher/>
        <MoleculesLanguageMenu/>
      </v-sheet>
    </v-app-bar>

    <v-main>
      <section class="position-relative overflow-hidden">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>

        <v-container max-width="1200">
          <v-row align="center" justify="center" class="py-4">
            <v-col cols="12" md="6" class="text-center text-md-left z-index-10">
              <h1 class="font-weight-black mb-2 text-dark-blue line-height-tight"
                  :class="{
                  'font-size-2': $device.isMobile,
                  'text-h4': !$device.isMobile
                }"
              >
                {{ t('landing.welcome') }}
              </h1>

              <p class="text-body-1 text-medium-emphasis mb-4 font-weight-regular max-width-500 mx-auto mx-md-0">
                {{ t('landing.subtitle') }}
              </p>

              <div class="d-flex flex-column flex-sm-row gap-4 justify-center justify-md-start">
                <v-btn
                    @click.prevent="login"
                    color="primary"
                    size="large"
                    variant="flat"
                    height="48"
                    class="text-capitalize font-weight-bold px-8 shadow-lg"
                    rounded="pill"
                    :loading="isLoading"
                >
                  <template #prepend>
                    <div class="bg-white rounded-circle pa-1 mr-2 d-flex">
                      <nuxt-icon filled name="google" class="google-icon"/>
                    </div>
                  </template>
                  {{ t('landing.cta') }}
                </v-btn>
              </div>
            </v-col>

            <v-col cols="12" md="6" class="text-center position-relative z-index-10">
              <div class="hero-image-container">
                <div class="floating-pill pill-1"></div>
                <div class="floating-pill pill-2"></div>
                <div class="glass-card main-card elevation-10">
                  <nuxt-icon filled name="application-icon" class="hero-icon"/>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <section class="pb-4">
        <v-container max-width="1200" class="py-0">
          <v-row justify="center" dense>
            <v-col cols="12" sm="6" lg="4" class="pa-3" v-for="(feature, i) in features" :key="i">
              <v-card
                  class="feature-card py-2 px-4 rounded-xl border-0 d-flex align-center"
                  elevation="1"
                  height="120"
                  variant="flat"
              >
                <div class="d-flex align-center">
                  <div class="feature-icon-box mr-4" :class="feature.colorClass">
                    <v-icon :icon="feature.icon" size="24" color="white"/>
                  </div>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-bold mb-0 text-dark-blue">
                      {{ t(feature.titleKey) }}
                    </h3>
                    <p class="text-caption text-medium-emphasis mb-0">
                      {{ t(feature.descKey) }}
                    </p>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>
    </v-main>

    <v-overlay
    :model-value="isLoading"
    class="align-center justify-center overlay-blur"
    persistent
    z-index="2000"
    >
    <v-card class="d-flex flex-column align-center pa-8 rounded-xl elevation-24">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <div class="mt-4 font-weight-bold text-h6">{{ t('login.completing') }}</div>
    </v-card>
    </v-overlay>
  </v-app>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n"
import {useUserStore} from "~/store/userStore"
import MoleculesLanguageMenu from "~/components/molecules/LanguageMenu.vue"

const userStore = useUserStore()
const {$device} = useNuxtApp()
const {t} = useI18n()

definePageMeta({
  layout: false,
})

const isLoading = ref(false)

const features = [
  {
    icon: 'mdi-barcode-scan',
    titleKey: 'landing.features.scan.title',
    descKey: 'landing.features.scan.desc',
    colorClass: 'bg-orange'
  },
  {
    icon: 'mdi-pill',
    titleKey: 'landing.features.track.title',
    descKey: 'landing.features.track.desc',
    colorClass: 'bg-primary'
  },
  {
    icon: 'mdi-bell-ring',
    titleKey: 'landing.features.reminders.title',
    descKey: 'landing.features.reminders.desc',
    colorClass: 'bg-red-accent-2'
  },
  {
    icon: 'mdi-format-list-checks',
    titleKey: 'landing.features.organize.title',
    descKey: 'landing.features.organize.desc',
    colorClass: 'bg-indigo'
  },
  {
    icon: 'mdi-content-duplicate',
    titleKey: 'landing.features.duplicate.title',
    descKey: 'landing.features.duplicate.desc',
    colorClass: 'bg-teal'
  },
  {
    icon: 'mdi-translate',
    titleKey: 'landing.features.bilingual.title',
    descKey: 'landing.features.bilingual.desc',
    colorClass: 'bg-purple'
  }
]

if (userStore.user) navigateTo('/medications')

const login = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await userStore.login()
    await navigateTo('/medications')
  } catch (e) {
    console.error('Login failed', e)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.text-dark-blue { color: #1e293b; }
.text-primary-darken-1 { color: #2563EB; }

.landing-page {
  background: var(--bg-surface);
  color: var(--text-main);
  font-family: 'Inter', Roboto, sans-serif;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
}

.shape-1 {
  width: 600px;
  height: 600px;
  background: rgba(59, 130, 246, 0.05);
  top: -200px;
  right: -200px;
}

.shape-2 {
  width: 500px;
  height: 500px;
  background: rgba(16, 185, 129, 0.05);
  bottom: -100px;
  left: -200px;
}

.line-height-tight {
  line-height: 1.1;
}

.tracking-tight {
  letter-spacing: -0.5px;
}

.shadow-lg {
  box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.3);
}

.app-icon-nav :deep(svg) {
  width: 28px;
  height: 28px;
  color: #2563EB;
}

.google-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.hero-image-container {
  position: relative;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-card {
  width: 180px;
  height: 180px;
  z-index: 2;
  animation: float 6s ease-in-out infinite;
}

.hero-icon :deep(svg) {
  width: 80px;
  height: 80px;
  color: #2563EB;
}

.floating-pill {
  position: absolute;
  border-radius: 50px;
  opacity: 0.8;
}

.pill-1 {
  width: 120px;
  height: 40px;
  background: #34D399;
  top: 20%;
  right: 15%;
  transform: rotate(-15deg);
  animation: float-delayed 7s ease-in-out infinite;
  z-index: 1;
}

.pill-2 {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #60A5FA;
  bottom: 15%;
  left: 15%;
  animation: float 8s ease-in-out infinite reverse;
  z-index: 1;
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 15px -3px rgba(0, 0, 0, 0.08);
}

.feature-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.overlay-blur {
  backdrop-filter: blur(4px);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes float-delayed {
  0%, 100% {
    transform: translateY(0) rotate(-15deg);
  }
  50% {
    transform: translateY(-15px) rotate(-15deg);
  }
}

.z-index-10 {
  z-index: 10;
}

.gap-3 {
  gap: 12px;
}

.gap-4 {
  gap: 16px;
}

.feature-card {
  background: var(--card-bg);
}

.dark-mode .glass-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.change-mode-btn :deep(.v-btn__overlay) {
  background-color: transparent !important;
}

.dark-mode .feature-card {
  background-color: #1e293b !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.dark-mode .text-dark-blue {
  color: #F8FAFC !important;
}

.dark-mode .text-medium-emphasis {
  color: #94A3B8 !important;
}
</style>