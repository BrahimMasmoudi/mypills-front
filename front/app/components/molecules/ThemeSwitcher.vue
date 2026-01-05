<template>
  <v-btn
      :ripple="false"
      class="change-mode-btn"
      icon
      variant="text"
      @click="toggleColorMode">
    <v-icon>{{ colorMode.value === 'dark' ? 'mdi-brightness-3' : 'mdi-brightness-5' }}</v-icon>
  </v-btn>
</template>

<script setup lang="ts">
const theme = useTheme() // Vuetify theme object
const colorMode = useColorMode()
const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light'
}

// Watch for changes in Nuxt color mode to update Vuetify theme
watch(() => colorMode.value, (val) => {
  theme.change(val)
}, {immediate: true})
</script>

<style scoped>
.text-primary-darken-1 {
  color: #2563EB;
}

.bg-soft-blue {
  background-color: #F8FAFC;
}

.bg-emerald {
  background: linear-gradient(135deg, #34D399 0%, #10B981 100%);
}

.bg-blue {
  background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
}

.bg-indigo {
  background: linear-gradient(135deg, #818CF8 0%, #6366F1 100%);
}

.bg-purple {
  background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);
}

.bg-orange {
  background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);
}

.bg-teal {
  background: linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%);
}

.landing-page {
  background: var(--bg-surface);
  color: var(--text-main);
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
.line-height-tight {
  line-height: 1.1;
}

.tracking-tight {
  letter-spacing: -0.5px;
}

/* Components */
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

/* Hero Illustration */
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

/* Animations */
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

/* Utils */
.z-index-10 {
  z-index: 10;
}

.gap-3 {
  gap: 12px;
}

.gap-4 {
  gap: 16px;
}

.text-dark-blue {
  color: var(--text-main);
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