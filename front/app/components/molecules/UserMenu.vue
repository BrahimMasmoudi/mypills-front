<template>
  <v-menu
    location="bottom end"
    transition="slide-y-transition"
    :offset="12"
    content-class="user-menu-popover"
  >
    <template #activator="{ props }">
      <div class="user-menu-activator" v-bind="props">
        <div class="avatar-wrapper shadow-premium">
          <v-avatar size="40" class="main-avatar">
            <v-img v-if="userStore.user?.photoURL" :src="userStore.user.photoURL" cover/>
            <v-icon
              v-else
              icon="mdi-account"
              size="28"
              color="white"
            />
          </v-avatar>
          <div class="menu-arrow-badge">
            <v-icon icon="mdi-chevron-down" size="14" />
          </div>
        </div>
      </div>
    </template>

    <v-card min-width="300" class="user-menu-card overflow-hidden">
      <!-- Gradient Header -->
      <div class="user-header pa-5 d-flex align-center">
        <div class="d-flex flex-column overflow-hidden">
          <span class="text-h6 font-weight-bold text-truncate text-capitalize mb-n1">
            {{ userStore.user?.displayName || t('user-menu.guest') }}
          </span>
          <span class="text-truncate">
            {{ userStore.user?.email }}
          </span>
        </div>
      </div>

      <v-divider class="border-opacity-25"/>

      <v-list density="comfortable" nav class="pa-3">
        <!-- Theme Toggle -->
        <v-list-item
          class="menu-item-premium mb-2"
          :ripple="{ class: 'text-primary' }"
          @click="toggleColorMode"
        >
          <template #prepend>
            <div class="icon-container mr-3" :class="colorMode.value === 'dark' ? 'icon-amber' : 'icon-blue'">
              <v-icon size="20">
                {{ colorMode.value === 'dark' ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}
              </v-icon>
            </div>
          </template>
          <v-list-item-title class="font-weight-bold text-body-2">
            {{ t('user-menu.change-theme') }}
          </v-list-item-title>
          <template #append>
            <span class="text-overline text-medium-emphasis text-uppercase fw-900">
              {{ colorMode.value }}
            </span>
          </template>
        </v-list-item>

        <!-- Language Switcher -->
        <v-menu location="start top" transition="scale-transition" :offset="12">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              class="mb-2"
            >
              <template #prepend>
                <div class="icon-container icon-indigo mr-3">
                  <v-icon icon="mdi-translate" size="20"/>
                </div>
              </template>
              <v-list-item-title class="font-weight-bold text-body-2">
                {{ t('user-menu.change-language') }}
              </v-list-item-title>
              <template #append>
                <v-icon icon="mdi-chevron-right" size="18" class="text-medium-emphasis"/>
              </template>
            </v-list-item>
          </template>

          <v-list
            density="compact"
            elevation="12"
            class=" py-2 pa-2"
            min-width="180"
          >
            <v-list-item
              v-for="lang in languages"
              :key="lang.code"
              :active="locale === lang.code"
              class="lang-item mb-1"
              color="primary"
              @click="switchLocale(lang.code)"
            >
              <template #prepend>
                <nuxt-icon :name="`flag-${lang.code}`" filled class="flag-icon-mini mr-3"/>
              </template>
              <v-list-item-title class="font-weight-bold text-body-2 text-capitalize">
                {{ lang.name }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Country Switcher -->
        <v-list-item
          class="menu-item-premium mb-2"
          :ripple="{ class: 'text-primary' }"
          @click="openCountryDialog"
        >
          <template #prepend>
            <div class="icon-container icon-teal mr-3">
              <v-icon icon="mdi-earth" size="20"/>
            </div>
          </template>
          <v-list-item-title class="font-weight-bold text-body-2">
            {{ t('user-menu.change-country') }}
          </v-list-item-title>
          <template #append>
            <nuxt-icon
              v-if="selectedCountry"
              :name="`flag-${selectedCountry?.toLowerCase()}`"
              filled
              class="flag-icon-mini ml-2"
            />
          </template>
        </v-list-item>

        <v-divider class="my-3 border-opacity-25 mx-4"/>

        <!-- Support -->
        <v-list-item
          class="menu-item-premium mb-2"
          :ripple="{ class: 'text-primary' }"
          @click="openSupportEmail"
        >
          <template #prepend>
            <div class="icon-container icon-blue mr-3">
              <v-icon icon="mdi-lifebuoy" size="20"/>
            </div>
          </template>
          <v-list-item-title class="font-weight-bold text-body-2">
            {{ t('user-menu.support') }}
          </v-list-item-title>
        </v-list-item>

        <!-- Disconnect -->
        <v-list-item
          class="menu-item-logout text-error"
          :ripple="{ class: 'text-error' }"
          @click="handleSignOut"
        >
          <template #prepend>
            <div class="icon-container icon-error mr-3">
              <v-icon icon="mdi-power" size="20"/>
            </div>
          </template>
          <v-list-item-title class="font-weight-black text-body-2">
            {{ t('user-menu.disconnect') }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { useUserStore } from '~/store/userStore';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify'
import { useCountryStore } from '~/store/country';
import CountryDialog from '~/components/molecules/CountryDialog.vue';
import { useLanguageStore } from '~/store/language';

const userStore = useUserStore()
const { t, locale } = useI18n()
const theme = useTheme()
const colorMode = useColorMode()
const { $open } = useNuxtApp()
const { confirmFrance, clearCountry } = useCountryStore()

const { selectedCountry } = storeToRefs(useCountryStore())
const langStore = useLanguageStore()

const handleSignOut = async () => {
  await userStore.logOut()
  navigateTo('/login')
}

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light'
}

const openSupportEmail = () => {
  const email = 'masmoudi.brahim@gmail.com'
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  if (isMobile) {
    window.location.href = `mailto:${email}`
  } else {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank')
  }
}


const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' }
]

const switchLocale = (newLocale: string) => {
  locale.value = newLocale
  langStore.switchLocale(newLocale)
}

watch(() => colorMode.value, (val) => {
  theme.change(val)
}, { immediate: true })

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
/* Glassmorphism Effect */
.glass-effect {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

:deep(.v-theme--dark) .glass-effect {
  background: rgba(23, 23, 23, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* User Header Gradient */
.user-header {
  background: linear-gradient(135deg, var(--v-primary-base) 0%, #6366f1 100%);
  position: relative;
}

.text-white-opac {
  color: rgba(255, 255, 255, 0.8);
}

/* Avatar Enhancements */
.user-menu-activator {
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.user-menu-activator:hover {
  transform: scale(1.08);
}

.avatar-wrapper {
  position: relative;
  border-radius: 50%;
}

.main-avatar {
  background-color: #1e293b;
}

:deep(.v-theme--dark) .main-avatar {
  background-color: #0f172a;
}

.status-dot {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 12px;
  height: 12px;
  background-color: #10b981;
  border: 2px solid white;
  border-radius: 50%;
  z-index: 1;
}

:deep(.v-theme--dark) .status-dot {
  border: 2px solid #0f172a;
}

.menu-arrow-badge {
  position: absolute;
  bottom: -2px;
  right: 1px;
  width: 12px;
  height: 12px;
  background-color: rgb(var(--v-theme-surface));
  border: 1.5px solid rgb(var(--v-theme-background));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
  color: rgb(var(--v-theme-on-surface));
}

:deep(.v-theme--dark) .menu-arrow-badge {
  background-color: #1e293b;
  border-color: #0f172a;
  color: white;
}

.avatar-glow {
  position: relative;
}

.avatar-glow::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  z-index: 0;
}

/* Menu Item Premium Styles */
.menu-item-premium {
  transition: all 0.2s ease;
}

.menu-item-premium:hover {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
  transform: translateX(4px);
}

.icon-container {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.icon-blue { background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.icon-amber { background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.icon-indigo { background-color: rgba(99, 102, 241, 0.1); color: #6366f1; }
.icon-teal { background-color: rgba(20, 184, 166, 0.1); color: #14b8a6; }
.icon-error { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; }

.fw-900 { font-weight: 900; }

.flag-icon-mini :deep(svg) {
  width: 22px;
  height: 22px;
}

.lang-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.shadow-premium {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}
</style>
