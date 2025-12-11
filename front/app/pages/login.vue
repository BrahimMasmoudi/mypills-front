<template>
  <v-app class="landing-page bg-primary-light">
    <!-- Navbar -->
    <v-app-bar elevation="1" class="bg-primary-light" height="80">
      <v-sheet class="bg-primary-light d-flex align-center justify-space-between px-5" width="100%">
        <div class="d-flex align-center gap-3">
          <v-avatar color="white" size="48" class="elevation-2">
            <nuxt-icon filled name="application-icon" class="app-icon-nav"/>
          </v-avatar>
          <span class="text-h5 font-weight-bold text-primary-darken-1 tracking-tight">
            MyPills
          </span>
        </div>
        <v-spacer/>
        <MoleculesLanguageSwitcher />
      </v-sheet>
    </v-app-bar>

    <v-main>
      <!-- Hero Section -->
      <section class="position-relative overflow-hidden">
        <!-- Abstract Background Shapes -->
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>

        <v-container max-width="1200">
          <v-row align="center" justify="center" class="min-h-[600px]">
            <!-- Text Content -->
            <v-col cols="12" md="6" class="text-center text-md-left z-index-10">              
              <h1 class="font-weight-black mb-6 text-dark-blue line-height-tight"
                :class="{
                  'font-size-3': $device.isMobile,
                  'text-h3': !$device.isMobile
                }"
              >
                {{ t('landing.welcome') }}
              </h1>
              
              <p class="text-h6 text-medium-emphasis mb-8 font-weight-regular max-width-500 mx-auto mx-md-0">
                {{ t('landing.subtitle') }}
              </p>

              <div class="d-flex flex-column flex-sm-row gap-4 justify-center justify-md-start">
                <v-btn
                    @click.prevent="login"
                    color="primary"
                    size="x-large"
                    variant="flat"
                    height="56"
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

            <!-- Hero Illustration -->
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

      <!-- Features Section -->
      <section>
        <v-container max-width="1200">
          <v-row>
            <v-col cols="12" sm="6" lg="3" v-for="(feature, i) in features" :key="i">
              <v-card
                class="feature-card h-100 pa-6 rounded-xl border-0"
                elevation="0"
                variant="flat"
              >
                <div class="feature-icon-box mb-4" :class="feature.colorClass">
                  <v-icon :icon="feature.icon" size="32" color="white" />
                </div>
                <h3 class="text-h6 font-weight-bold mb-2 text-dark-blue">
                  {{ t(feature.titleKey) }}
                </h3>
                <p class="text-body-2 text-medium-emphasis">
                  {{ t(feature.descKey) }}
                </p>
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
      <div class="d-flex flex-column align-center bg-white pa-8 rounded-xl elevation-24">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <div class="mt-4 font-weight-bold text-dark-blue text-h6">{{ t('login.completing') }}</div>
      </div>
    </v-overlay>
  </v-app>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import {useUserStore} from "~/store/userStore";
import MoleculesLanguageSwitcher from "~/components/molecules/LanguageSwitcher.vue";

const userStore = useUserStore()
const {$device} = useNuxtApp()
const {t} = useI18n()

definePageMeta({
  layout: false,
})

const isLoading = ref(false)

const features = [
  {
    icon: 'mdi-pill',
    titleKey: 'landing.features.track.title',
    descKey: 'landing.features.track.desc',
    colorClass: 'bg-emerald'
  },
  {
    icon: 'mdi-shield-check',
    titleKey: 'landing.features.safety.title',
    descKey: 'landing.features.safety.desc',
    colorClass: 'bg-blue'
  },
  {
    icon: 'mdi-format-list-checks',
    titleKey: 'landing.features.organize.title',
    descKey: 'landing.features.organize.desc',
    colorClass: 'bg-indigo'
  },
  {
    icon: 'mdi-translate',
    titleKey: 'landing.features.bilingual.title',
    descKey: 'landing.features.bilingual.desc',
    colorClass: 'bg-purple'
  }
]

if (userStore.user) navigateTo('/')

const login = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    await userStore.login()
    await navigateTo('/')
  } catch (e) {
    console.error('Login failed', e)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Color Palette & Variables */
.text-dark-blue { color: #1e293b; }
.text-primary-darken-1 { color: #2563EB; }
.bg-soft-blue { background-color: #F8FAFC; }

.bg-emerald { background: linear-gradient(135deg, #34D399 0%, #10B981 100%); }
.bg-blue { background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%); }
.bg-indigo { background: linear-gradient(135deg, #818CF8 0%, #6366F1 100%); }
.bg-purple { background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%); }

.landing-page {
    background: #ffffff;
    font-family: 'Inter', Roboto, sans-serif;
}

/* Background Abstract Shapes */
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

/* Typography */
.line-height-tight { line-height: 1.1; }
.tracking-tight { letter-spacing: -0.5px; }

/* Components */
.shadow-lg { box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.3); }

.app-icon-nav :deep(svg) {
    width: 28px;
    height: 28px;
    color: #2563EB;
}

.google-icon :deep(svg) {
    width: 18px;
    height: 18px;
}

/* Hero Illustration */
.hero-image-container {
    position: relative;
    height: 400px;
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
    width: 240px;
    height: 240px;
    z-index: 2;
    animation: float 6s ease-in-out infinite;
}

.hero-icon :deep(svg) {
    width: 120px;
    height: 120px;
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

/* Feature Cards */
.feature-card {
    background: #ffffff;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.feature-icon-box {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.overlay-blur {
    backdrop-filter: blur(4px);
}

/* Animations */
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}
@keyframes float-delayed {
    0%, 100% { transform: translateY(0) rotate(-15deg); }
    50% { transform: translateY(-15px) rotate(-15deg); }
}

/* Utils */
.z-index-10 { z-index: 10; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
</style>