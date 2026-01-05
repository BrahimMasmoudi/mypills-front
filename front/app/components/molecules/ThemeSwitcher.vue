<template>
  <v-btn
      :ripple="false"
      class="change-mode-btn"
      icon
      :color="colorMode.value === 'dark' ? 'amber' : 'black'"
      variant="text"
      @click="toggleColorMode">
    <v-icon>{{ colorMode.value === 'dark' ? 'mdi-brightness-3' : 'mdi-brightness-5' }}</v-icon>
  </v-btn>
</template>

<script setup lang="ts">
const theme = useTheme()
const colorMode = useColorMode()
const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light'
}

watch(() => colorMode.value, (val) => {
  theme.change(val)
}, {immediate: true})
</script>

<style scoped>

.hero-icon :deep(svg) {
  width: 80px;
  height: 80px;
  color: #2563EB;
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