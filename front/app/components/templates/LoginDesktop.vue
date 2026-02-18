<template>
  <div class="d-flex h-screen w-screen overflow-hidden position-relative transition-all" :class="isDark ? 'bg-surface' : 'bg-soft-gradient'">
    
    <!-- Gradient Overlay for Dark Mode Texture -->
    <div v-if="isDark" class="dark-gradient-overlay"></div>

    <v-container fluid class="fill-height pa-0 position-relative z-10">
      <v-row no-gutters class="fill-height">
        
        <!-- LEFT SIDE: Branding & Onboarding (Desktop) -->
        <v-col cols="12" md="6" lg="7" class="d-none d-md-flex align-center justify-center pa-12">
          <div class="d-flex flex-column max-width-600 w-100">
            
            <!-- App Logo & Name -->
            <div class="d-flex align-center gap-4 mb-2 animate-fade-down" style="animation-delay: 0.1s">
              <div class="logo-box elevation-3" :class="isDark ? 'bg-surface-light' : 'bg-white text-primary'">
                <nuxt-icon filled name="application-icon" class="logo-icon"/>
              </div>
              <!-- Text color adapts to background: white on gradient, on-surface on dark -->
              <h1 class="text-h3 font-weight-black tracking-tight text-shadow-sm" :class="isDark ? 'text-on-surface' : 'text-white'">MyPills</h1>
            </div>

            <h2 class="text-h4 font-weight-regular mb-10 opacity-90 animate-fade-down" :class="isDark ? 'text-medium-emphasis' : 'text-white'" style="animation-delay: 0.2s">
              {{ t('landing.catchphrase') }}
            </h2>

            <!-- Feature Highlights List -->
            <div class="feature-list d-flex flex-column gap-4">
              
              <div class="feature-item d-flex align-center gap-4 pa-4 rounded-xl backdrop-blur animate-slide-right" 
                   :class="isDark ? 'bg-surface-light border-subtle' : 'bg-white-10'"
                   style="animation-delay: 0.3s">
                <div class="icon-circle" :class="isDark ? 'bg-surface text-blue' : 'bg-white text-blue'">
                  <v-icon icon="mdi-package-variant-closed" size="24" />
                </div>
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold" :class="isDark ? 'text-high-emphasis' : 'text-white'">{{ t('landing.features.track.title') }}</h3>
                  <p class="text-body-2 opacity-80 mb-0" :class="isDark ? 'text-medium-emphasis' : 'text-white'">{{ t('landing.features.track.desc') }}</p>
                </div>
              </div>

              <div class="feature-item d-flex align-center gap-4 pa-4 rounded-xl backdrop-blur animate-slide-right"
                   :class="isDark ? 'bg-surface-light border-subtle' : 'bg-white-10'"
                   style="animation-delay: 0.4s">
                 <div class="icon-circle" :class="isDark ? 'bg-surface text-purple' : 'bg-white text-purple'">
                  <v-icon icon="mdi-bell-ring-outline" size="24" />
                </div>
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold" :class="isDark ? 'text-high-emphasis' : 'text-white'">{{ t('landing.features.reminders.title') }}</h3>
                  <p class="text-body-2 opacity-80 mb-0" :class="isDark ? 'text-medium-emphasis' : 'text-white'">{{ t('landing.features.reminders.desc') }}</p>
                </div>
              </div>

              <div class="feature-item d-flex align-center gap-4 pa-4 rounded-xl backdrop-blur animate-slide-right"
                   :class="isDark ? 'bg-surface-light border-subtle' : 'bg-white-10'"
                   style="animation-delay: 0.5s">
                 <div class="icon-circle" :class="isDark ? 'bg-surface text-green' : 'bg-white text-green'">
                  <v-icon icon="mdi-barcode-scan" size="24" />
                </div>
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold" :class="isDark ? 'text-high-emphasis' : 'text-white'">{{ t('landing.features.scan.title') }}</h3>
                  <p class="text-body-2 opacity-80 mb-0" :class="isDark ? 'text-medium-emphasis' : 'text-white'">{{ t('landing.features.scan.desc') }}</p>
                </div>
              </div>

               <div class="feature-item d-flex align-center gap-4 pa-4 rounded-xl backdrop-blur animate-slide-right"
                    :class="isDark ? 'bg-surface-light border-subtle' : 'bg-white-10'"
                    style="animation-delay: 0.6s">
                 <div class="icon-circle" :class="isDark ? 'bg-surface text-orange' : 'bg-white text-orange'">
                  <v-icon icon="mdi-shield-lock-outline" size="24" />
                </div>
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold" :class="isDark ? 'text-high-emphasis' : 'text-white'">{{ t('landing.features.prescriptions.title') }}</h3>
                  <p class="text-body-2 opacity-80 mb-0" :class="isDark ? 'text-medium-emphasis' : 'text-white'">{{ t('landing.features.prescriptions.desc') }}</p>
                </div>
              </div>

            </div>
          </div>
        </v-col>

        <!-- RIGHT SIDE: Login Card -->
        <v-col cols="12" md="6" lg="5" class="d-flex align-center justify-center">
          <v-card class="login-card w-100 max-width-450 rounded-xxl elevation-16 pa-8 pa-md-10 position-relative overflow-visible animate-zoom-in" :color="isDark ? 'surface' : 'white'">
            
            <!-- Absolute Theme Controls -->
            <div class="position-absolute top-0 right-0 pa-2 pr-6 d-flex gap-2">
              <MoleculesThemeSwitcher variant="text"/>
              <MoleculesLanguageMenu variant="text"/>
            </div>

            <!-- Login Content -->
            <div class="text-center mt-8">
              <div class="mb-4">
                <h2 class="text-h4 font-weight-black mb-2 text-high-emphasis">{{ t('login.welcome') }}</h2>
                <p class="text-body-1 text-medium-emphasis">
                  {{ t('login.subtitle') }}
                </p>
              </div>

              <v-btn
          @click.prevent="emit('login')"
          height="56"
          block
          color="primary"
          class="google-btn mb-6 font-weight-bold text-body-1 rounded-lg"
          :loading="isLoading"
          variant="outlined"
          elevation="0"
       >
          <template #prepend>
             <div class="mr-3 d-flex">
                <nuxt-icon filled name="google" class="google-icon"/>
             </div>
          </template>
          {{ t('login.google') }}
       </v-btn>
              <div class="d-flex justify-center gap-2 mt-4">
          <v-chip size="x-small" variant="tonal" color="success" class="font-weight-medium">
             <v-icon start icon="mdi-lock" size="12"/> {{ t('login.badges.encrypted') }}
          </v-chip>
          <v-chip size="x-small" variant="tonal" color="primary" class="font-weight-medium">
             <v-icon start icon="mdi-cloud-check" size="12"/> {{ t('login.badges.cloud') }}
          </v-chip>
       </div>

              <div class="d-flex align-center justify-center gap-2 pa-3 rounded-lg text-caption text-medium-emphasis">
                 {{ t('login.privacy') }}
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n"
import { useTheme } from 'vuetify'
import MoleculesLanguageMenu from "~/components/molecules/LanguageMenu.vue"
import MoleculesThemeSwitcher from "~/components/molecules/ThemeSwitcher.vue"

const {t} = useI18n()
const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

defineProps<{
  isLoading: boolean
}>()

const emit = defineEmits(['login'])
</script>

<style scoped>
/* UTILS */
.h-screen { height: 100vh; }
.w-screen { width: 100vw; }
.z-10 { z-index: 10; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.max-width-600 { max-width: 600px; }
.max-width-450 { max-width: 450px; }
.tracking-tight { letter-spacing: -0.03em; }
.rounded-xxl { border-radius: 32px !important; }

/* THEME: Soft Gradient Background (Light Mode) */
.bg-soft-gradient {
  background: linear-gradient(135deg, #4F46E5 0%, #06b6d4 50%, #8b5cf6 100%);
}

.dark-gradient-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 30%, rgba(79, 70, 229, 0.15) 0%, transparent 60%),
              radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.15) 0%, transparent 60%);
  z-index: 0;
}

/* LOGO */
.logo-box {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-icon :deep(svg) { width: 40px; height: 40px; }

/* FEATURE LIST */
.bg-white-10 { background-color: rgba(255, 255, 255, 0.15); }
.backdrop-blur { backdrop-filter: blur(10px); }

.feature-item {
  border: 1px solid transparent; /* default */
  transition: transform 0.2s ease;
}
.feature-item.border-subtle {
  border: 1px solid rgba(var(--v-border-color), 0.15);
}

.feature-item:hover {
  transform: translateX(10px);
}
/* Enhanced hover for light mode */
.bg-soft-gradient .feature-item:hover {
  background-color: rgba(255, 255, 255, 0.25);
}
/* Enhanced hover for dark mode */
.bg-surface .feature-item:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* LOGIN CARD */
.login-card {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

.google-btn {
  transition: all 0.2s;
}
.google-btn:hover {
  transform: translateY(-2px);
}
.google-icon :deep(svg) { width: 24px; height: 24px; }

/* ENTRANCE ANIMATIONS */
@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideRight {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-down { animation: fadeDown 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
.animate-slide-right { animation: slideRight 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }
.animate-zoom-in { animation: zoomIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; }

.text-shadow-sm { text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.transition-all { transition: all 0.3s ease; }
</style>
