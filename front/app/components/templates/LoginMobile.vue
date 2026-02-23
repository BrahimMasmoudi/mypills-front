<template>
  <div
    class="mobile-login-container d-flex flex-column h-screen w-screen overflow-hidden position-relative"
    :class="isDark ? 'bg-surface' : 'bg-medical-gradient'"
  >
    
    <!-- 1. HERO SECTION (Top 35%) -->
    <div class="hero-section position-relative d-flex flex-column align-center justify-center text-center px-6">
       
      <div class="position-relative z-10 animate-fade-in-up">
        <div class="logo-box mx-auto mb-4 elevation-6 glass-effect">
          <nuxt-icon filled name="application-icon" class="logo-svg text-primary"/>
        </div>
        <h1 class="text-h4 font-weight-black tracking-tight mb-2 text-white text-shadow-sm">
          MyPills
        </h1>
        <p class="text-subtitle-1 font-weight-medium text-white opacity-90 leading-tight max-width-250 mx-auto">
          {{ t('landing.catchphrase') }}
        </p>
      </div>
    </div>

    <!-- 2. ONBOARDING CAROUSEL (Middle) -->
    <div class="carousel-section flex-grow-1 d-flex flex-column justify-center position-relative z-10">
      <v-carousel
        hide-delimiter-background
        :show-arrows="false"
        height="280"
        cycle
        hide-delimiters
        interval="2000"
        class="custom-carousel"
      >
        <v-carousel-item v-for="(feature, i) in features" :key="i">
          <div class="d-flex justify-center px-6 h-100 align-center">
            <div class="feature-card glass-card pa-6 w-100 text-center rounded-xl elevation-4 border-subtle d-flex flex-column align-center justify-center">
              <div class="icon-box mb-4" :class="feature.color">
                <v-icon :icon="feature.icon" size="32" color="white" />
              </div>
              <h3 class="text-h6 font-weight-bold mb-2" :class="isDark ? 'text-high-emphasis' : 'text-primary-dark'">
                {{ feature.title }}
              </h3>
              <p class="text-body-2 mb-0" :class="isDark ? 'text-medium-emphasis' : 'text-secondary-dark'">
                {{ feature.desc }}
              </p>
            </div>
          </div>
        </v-carousel-item>
      </v-carousel>
    </div>

    <!-- 3. BOTTOM LOGIN (Sticky) -->
    <v-sheet class="bottom-sheet rounded-t-xl pa-8 pb-10 z-20 animate-slide-up">
      <!-- Theme Controls (Absolute Top Right of Sheet) -->
      <div class="position-absolute top-0 right-0 pa-4 d-flex gap-2">
        <MoleculesThemeSwitcher class="mt-1" variant="text" size="small"/>
        <MoleculesLanguageMenu variant="text" size="small"/>
      </div>

      <div class="text-center mb-6 pt-6">
        <h2 class="text-h5 font-weight-bold mb-1">{{ t('login.welcome') }}</h2>
        <p class="text-caption text-medium-emphasis">{{ t('login.subtitle') }}</p>
      </div>

      <v-btn
        height="56"
        block
        color="primary"
        class="google-btn mb-6 font-weight-bold text-body-1 rounded-lg"
        :loading="isLoading"
        variant="outlined"
        elevation="0"
        @click.prevent="emit('login')"
      >
        <template #prepend>
          <div class="mr-3 d-flex">
            <nuxt-icon filled name="google" class="google-icon"/>
          </div>
        </template>
        {{ t('login.google') }}
      </v-btn>

      <div class="d-flex justify-center gap-3 mb-4">
        <v-chip
          size="x-small"
          variant="tonal"
          color="success"
          class="font-weight-medium"
        >
          <v-icon start icon="mdi-lock" size="12"/> {{ t('login.badges.encrypted') }}
        </v-chip>
        <v-chip
          size="x-small"
          variant="tonal"
          color="primary"
          class="font-weight-medium"
        >
          <v-icon start icon="mdi-cloud-check" size="12"/> {{ t('login.badges.cloud') }}
        </v-chip>
      </div>

      <p class="text-caption text-center text-disabled mb-0">
        {{ t('login.privacy') }}
      </p>
    </v-sheet>

  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import MoleculesLanguageMenu from '~/components/molecules/LanguageMenu.vue'
import MoleculesThemeSwitcher from '~/components/molecules/ThemeSwitcher.vue'

const { t } = useI18n()
const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

defineProps<{
  isLoading: boolean
}>()

const emit = defineEmits(['login'])

const features = computed(() => [
   {
      title: t('landing.features.track.title'),
      desc: t('landing.features.track.desc'),
      icon: 'mdi-pill',
      color: 'bg-blue'
   },
   {
      title: t('landing.features.reminders.title'),
      desc: t('landing.features.reminders.desc'),
      icon: 'mdi-bell-ring',
      color: 'bg-purple'
   },
   {
      title: t('landing.features.scan.title'),
      desc: t('landing.features.scan.desc'),
      icon: 'mdi-barcode-scan',
      color: 'bg-teal'
   },
   {
      title: t('landing.features.prescriptions.title'),
      desc: t('landing.features.prescriptions.desc'),
      icon: 'mdi-shield-lock-outline',
      color: 'bg-indigo'
   }
])
</script>

<style scoped>
/* STRUCTURE */
.mobile-login-container {
  /* No specific width constraints here, relies on parent or viewport */
}

/* GRADIENTS */
.bg-medical-gradient {
   background: linear-gradient(180deg, #4f46e5 0%, #06b6d4 100%);
}

/* HERO */
.hero-section {
   height: 35%;
   min-height: 250px;
}
.logo-box {
   width: 72px; height: 72px;
   border-radius: 22px;
   background: rgba(255,255,255,0.9);
   display: flex; align-items: center; justify-content: center;
   backdrop-filter: blur(10px);
}
.logo-svg :deep(svg) { width: 40px; height: 40px; }

/* CAROUSEL */
.glass-card {
   background: rgba(255, 255, 255, 0.9);
   backdrop-filter: blur(20px);
   border: 1px solid rgba(255,255,255,0.6);
   height: 220px;
}
/* Dark Mode Override for Glass Card */
.bg-surface .glass-card {
   background: rgba(30, 41, 59, 0.7);
   border-color: rgba(255,255,255,0.1);
}

.icon-box {
   width: 64px; height: 64px; border-radius: 20px;
   display: flex; align-items: center; justify-content: center;
   box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}

.text-primary-dark { color: #1e3a8a; }
.text-secondary-dark { color: #334155; }
.border-subtle { border: 1px solid rgba(0,0,0,0.05); }

/* BOTTOM SHEET */
.bottom-sheet {
   box-shadow: 0 -10px 40px rgba(0,0,0,0.15) !important;
}

.google-btn {
   transition: transform 0.2s;
}
.google-btn:active { transform: scale(0.98); }
.google-icon :deep(svg) { width: 20px; height: 20px; }

/* ANIMATIONS */
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }

.animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
.animate-slide-up { animation: slideUp 0.6s ease-out forwards; }

.text-shadow-sm { text-shadow: 0 2px 4px rgba(0,0,0,0.15); }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.leading-tight { line-height: 1.2; }
.max-width-250 { max-width: 250px; }
</style>
