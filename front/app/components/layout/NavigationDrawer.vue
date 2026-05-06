<template>
  <v-navigation-drawer v-model="drawer" temporary close-delay="0" elevation="0" border="e">
    <v-list nav class="pa-4">

      <v-list-item to="/medications" rounded="pill" class="mb-2 nav-pill" active-class="active-pill" link>
        <template #prepend>
          <v-icon icon="mdi-pill" size="20" class="ml-2 mr-n3" />
        </template>
        <v-list-item-title class="font-weight-bold ml-4">
          {{ t('nav.medications') }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item to="/reminders" rounded="pill" class="mb-2 nav-pill" active-class="active-pill" link>
        <template #prepend>
          <v-icon icon="mdi-calendar-clock" size="20" class="ml-2 mr-n3" />
        </template>
        <v-list-item-title class="font-weight-bold ml-4">
          {{ t('nav.reminders') }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item to="/prescriptions" rounded="pill" class="mb-2 nav-pill" active-class="active-pill" link>
        <template #prepend>
          <v-icon icon="mdi-folder-upload-outline" size="20" class="ml-2 mr-n3" />
        </template>
        <v-list-item-title class="font-weight-bold ml-4">
          {{ t('nav.prescriptions') }}
        </v-list-item-title>
      </v-list-item>

      <!-- ── Divider before Advisor ── -->

      <template v-if="userStore.isSuperUser">
        <v-divider class="my-3 mx-2" />


        <!-- ✦ AI Advisor — premium card item -->
        <v-list-item v-if="userStore.isSuperUser" to="/advisor" rounded="xl" class="advisor-nav-item"
          active-class="advisor-nav-active" link>
          <template #prepend>
            <span class="advisor-icon-chip ml-1 mr-1">
              <v-icon icon="mdi-robot-outline" size="18" />
              <span class="orbit-ring" aria-hidden="true" />
            </span>
          </template>
          <div class="ml-3">
            <div class="advisor-nav-title">{{ t('medicationAdvisor.title') }}</div>
            <div class="advisor-nav-sub">AI-powered</div>
          </div>
        </v-list-item>

      </template>

      <v-divider class="my-3 mx-2" />

      <!-- Support -->
      <v-list-item rounded="pill" class="mb-2 nav-pill" link @click="openSupportEmail">
        <template #prepend>
          <v-icon icon="mdi-lifebuoy" size="20" class="ml-2 mr-n3" />
        </template>
        <v-list-item-title class="font-weight-bold ml-4">
          {{ t('user-menu.support') }}
        </v-list-item-title>
      </v-list-item>

    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useUserStore } from '~/store/userStore'

const drawer = defineModel<boolean>()
const { t } = useI18n()
const userStore = useUserStore()

const openSupportEmail = () => {
  const email = 'masmoudi.brahim@gmail.com'
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  if (isMobile) {
    window.location.href = `mailto:${email}`
  } else {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank')
  }
}
</script>

<style scoped>
/* ── Standard nav pills ── */
.nav-pill {
  transition: all 0.2s ease-in-out;
  color: rgba(var(--v-theme-on-surface), 0.6);
  min-height: 44px !important;
}

.active-pill {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
  box-shadow: 0 4px 10px rgba(var(--v-theme-primary), 0.3);
}

.active-pill :deep(.v-icon) {
  color: white !important;
}

:deep(.v-list-item__spacer) {
  width: 12px !important;
}

/* ── AI Advisor premium item ── */
.advisor-nav-item {
  background: linear-gradient(135deg,
      rgba(var(--v-theme-primary), 0.08) 0%,
      rgba(129, 140, 248, 0.12) 100%);
  border: 1px solid rgba(var(--v-theme-primary), 0.18);
  min-height: 56px !important;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}

.advisor-nav-item:hover {
  box-shadow: 0 2px 16px rgba(var(--v-theme-primary), 0.18);
  border-color: rgba(var(--v-theme-primary), 0.35);
}

.advisor-nav-active {
  background: linear-gradient(135deg,
      rgba(var(--v-theme-primary), 0.18) 0%,
      rgba(129, 140, 248, 0.22) 100%) !important;
  border-color: rgba(var(--v-theme-primary), 0.45) !important;
  box-shadow: 0 4px 18px rgba(var(--v-theme-primary), 0.22) !important;
}

/* Icon chip -- small gradient orb */
.advisor-icon-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), #818cf8);
  color: #fff;
  flex-shrink: 0;
}

.advisor-icon-chip :deep(.v-icon) {
  color: #fff !important;
}

/* Slow orbit ring */
.orbit-ring {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1.5px solid rgba(var(--v-theme-primary), 0.45);
  animation: orbit-pulse 2.8s ease-in-out infinite;
}

@keyframes orbit-pulse {

  0%,
  100% {
    opacity: 0.7;
    transform: scale(1);
  }

  50% {
    opacity: 0;
    transform: scale(1.35);
  }
}

.advisor-nav-title {
  font-size: 0.875rem;
  font-weight: 700;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.advisor-nav-sub {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-primary), 0.55);
  margin-top: 1px;
}
</style>