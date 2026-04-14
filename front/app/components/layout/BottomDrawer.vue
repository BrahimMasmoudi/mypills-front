<template>
  <v-bottom-navigation grow color="primary" app class="bottom-nav">

    <v-btn to="/medications" class="nav-btn">
      <v-icon>mdi-pill</v-icon>
      <span>{{ t('nav.medications') }}</span>
    </v-btn>

    <v-btn to="/reminders" class="nav-btn">
      <v-icon>mdi-calendar-clock</v-icon>
      <span>{{ t('nav.reminders') }}</span>
    </v-btn>

  

    <v-btn to="/prescriptions" class="nav-btn">
      <v-icon>mdi-folder-upload-outline</v-icon>
      <span>{{ t('nav.prescriptions') }}</span>
    </v-btn>

      <!-- ✦ AI Advisor — hero tab -->
    <v-btn to="/advisor" class="nav-btn advisor-tab">
      <span class="advisor-icon-bubble">
        <v-icon size="20">mdi-robot-outline</v-icon>
        <span class="pulse-dot" aria-hidden="true" />
      </span>
      <span class="advisor-tab-label">{{ t('medicationAdvisor.title') }}</span>
    </v-btn>

  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.bottom-nav {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.07) !important;
}

.nav-btn {
  font-size: 10px !important;
  letter-spacing: 0 !important;
}

/* ── Advisor tab ── */
.advisor-tab :deep(.v-btn__content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

/* Gradient icon bubble replaces the bare icon */
.advisor-icon-bubble {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), #818cf8);
  box-shadow: 0 3px 12px rgba(var(--v-theme-primary), 0.38);
  color: #fff;
  /* Pull the bubble up slightly within the tab without overflow */
  margin-top: -4px;
  transition: box-shadow 0.25s ease;
}

.advisor-tab:hover .advisor-icon-bubble,
.advisor-tab:focus .advisor-icon-bubble {
  box-shadow: 0 4px 20px rgba(var(--v-theme-primary), 0.55);
}

/* Override icon color inside bubble */
.advisor-icon-bubble :deep(.v-icon) {
  color: #fff !important;
}

/* Small pulsing green dot — "AI is ready" signal */
.pulse-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.6);
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.55); }
  70%  { box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
  100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
}

/* Gradient label text */
.advisor-tab-label {
  font-size: 10px;
  font-weight: 700;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0;
}
</style>