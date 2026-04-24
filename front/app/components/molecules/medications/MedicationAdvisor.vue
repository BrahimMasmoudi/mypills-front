<template>
  <v-sheet class="advisor-shell">
    <div class="mesh-bg" aria-hidden="true">
      <div class="mesh-orb orb-1" />
      <div class="mesh-orb orb-2" />
      <div class="mesh-orb orb-3" />
    </div>

    <v-container max-width="860" class="advisor-container">

      <div class="advisor-header" :class="{ 'header-compact': !!aiResponse }">
        <div class="header-badge">
          <v-icon icon="mdi-robot-outline" size="20" class="mr-1" />
          <span>{{ t('medicationAdvisor.title') }}</span>
        </div>
        <p class="advisor-subtitle" v-if="!aiResponse">{{ t('medicationAdvisor.description') }}</p>
      </div>

      <div class="disclaimer-strip" v-if="!aiResponse">
        <v-icon icon="mdi-shield-alert-outline" size="36" class="mr-2 flex-shrink-0" />
        <span>{{ t('medicationAdvisor.strictDisclaimer') }}</span>
      </div>
      <div class="glass-card input-card" :class="{ 'input-card-compact': !!aiResponse }">
        <div v-if="hasReachedLimit" class="quota-banner">
          <v-icon icon="mdi-clock-alert-outline" class="mr-2" />
          {{ t('medicationAdvisor.quotaExceeded') }}
        </div>

        <v-textarea
          v-model="symptomInput"
          :placeholder="t('medicationAdvisor.placeholder')"
          variant="solo"
          :rows="aiResponse ? 2 : 4"
          flat
          hide-details
          :disabled="hasReachedLimit"
          class="advisor-textarea"
          bg-color="transparent"
          auto-grow
        />

        <div class="input-footer">
          <span class="char-hint" :class="{ 'char-warn': symptomInput.length > 280 }">
            {{ symptomInput.length }} / 300
          </span>
          <v-btn
            class="ask-btn"
            color="primary"
            variant="tonal"
            :loading="isLoading"
            :disabled="isLoading || !symptomInput.trim() || hasReachedLimit || symptomInput.length > 300"
            @click="getAdvice"
          >
            <template #prepend>
              <v-icon icon="mdi-sparkles" />
            </template>
            {{ t('medicationAdvisor.button') }}
          </v-btn>
        </div>
      </div>

      <!-- Loading state -->
      <Transition name="fade-up">
        <div v-if="isLoading" class="glass-card response-card loading-card py-4">
          <div class="loading-signal">
            <span class="dot" /><span class="dot" /><span class="dot" />
          </div>
          <Transition name="fade" mode="out-in">
            <p :key="currentLoadingMessage" class="loading-label">{{ currentLoadingMessage }}</p>
          </Transition>
        </div>
      </Transition>

      <!-- Error -->
      <Transition name="fade-up">
        <div v-if="errorMessage && !isLoading" class="error-strip">
          <v-icon icon="mdi-alert-circle-outline" class="mr-2" />
          {{ errorMessage }}
        </div>
      </Transition>

      <!-- Response card -->
      <Transition name="fade-up">
        <div v-if="aiResponse && !isLoading" class="glass-card response-card">

          <div class="response-header">
            <span class="response-badge">
              <v-icon icon="mdi-check-decagram" size="14" class="mr-1" />
              {{ t('medicationAdvisor.suggestions') }}
            </span>
            <v-btn
              size="x-small"
              variant="text"
              icon="mdi-close"
              class="dismiss-btn"
              @click="aiResponse = null; symptomInput = ''"
            />
          </div>

          <p class="response-text">{{ aiResponse.explanation }}</p>

          <div v-if="aiResponse.usableMedications?.length" class="meds-section">
            <div class="meds-label">{{ t('medicationAdvisor.usableMedications') }}</div>
            <div class="meds-chips">
              <div
                v-for="(med, i) in aiResponse.usableMedications"
                :key="med.medicationId"
                class="med-chip"
                :style="`animation-delay: ${i * 80}ms`"
              >
                <v-icon icon="mdi-pill" size="14" class="mr-1 chip-icon" />
                {{ med.name }}
              </div>
            </div>
          </div>

          <div v-else class="no-meds-notice">
            <v-icon icon="mdi-information-outline" class="mr-2" size="16" />
            {{ t('medicationAdvisor.disclaimer') }}
          </div>

        </div>
      </Transition>

    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMedicationsStore } from '~/store/medications'
import { useI18n } from 'vue-i18n'
import type { Medication } from '~/types/medication'

const medicationsStore = useMedicationsStore()
const { hasReachedLimit } = storeToRefs(medicationsStore)
const { tm, t, locale } = useI18n()

const symptomInput = ref('')
const isLoading = ref(false)
const aiResponse = ref<{ explanation: string; usableMedications: Medication[] } | null>(null)
const errorMessage = ref('')

const loadingMessageIndex = ref(0)
let loadingInterval: any = null

const loadingPhrases = computed(() => {
  const phrases = tm('medicationAdvisor.loadingPhrases')
  return Array.isArray(phrases) ? phrases : [t('medicationAdvisor.buttonLoading')]
})

const currentLoadingMessage = computed(() => {
  return loadingPhrases.value[loadingMessageIndex.value % loadingPhrases.value.length]
})

onUnmounted(() => {
  if (loadingInterval) clearInterval(loadingInterval)
})

const getAdvice = async () => {
  if (!symptomInput.value.trim()) {
    errorMessage.value = t('medicationAdvisor.errorEmpty')
    return
  }

  isLoading.value = true
  aiResponse.value = null
  errorMessage.value = ''

  loadingMessageIndex.value = 0
  loadingInterval = setInterval(() => {
    loadingMessageIndex.value++
  }, 1200)

  try {
    aiResponse.value = await medicationsStore.getMedicationAdvice(symptomInput.value, locale.value)
  } catch (error: any) {
    console.error('Advisor Error:', error)
    errorMessage.value = error.message || t('error')
  } finally {
    isLoading.value = false
    if (loadingInterval) clearInterval(loadingInterval)
  }
}
</script>

<style scoped>
/* ─── Shell & Background ─────────────────────────── */
.advisor-shell {
  min-height: 100%;
  position: relative;
  overflow: hidden;
}

.mesh-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.mesh-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.22;
  animation: orb-drift 18s ease-in-out infinite alternate;
}

.orb-1 {
  width: 520px; height: 520px;
  background: radial-gradient(circle, #5c7cfa, transparent 70%);
  top: -120px; left: -80px;
  animation-duration: 20s;
}

.orb-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #22d3ee, transparent 70%);
  bottom: -80px; right: -60px;
  animation-duration: 25s;
  animation-delay: -8s;
}

.orb-3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #a78bfa, transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation-duration: 16s;
  animation-delay: -4s;
}

@keyframes orb-drift {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(40px, 30px) scale(1.08); }
}

/* ─── Container ──────────────────────────────────── */
.advisor-container {
  position: relative;
  z-index: 1;
  padding-top: 32px;
  padding-bottom: 48px;
}

/* ─── Header ─────────────────────────────────────── */
.advisor-header {
  text-align: center;
  margin-bottom: 16px;
  transition: margin 0.4s ease;
}

.advisor-header.header-compact {
  margin-bottom: 16px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid rgba(var(--v-theme-primary), 0.25);
  border-radius: 100px;
  padding: 4px 12px;
  margin-bottom: 14px;
}

.advisor-title {
  font-size: clamp(1.7rem, 5vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  background: linear-gradient(135deg, rgb(var(--v-theme-on-surface)), rgb(var(--v-theme-primary)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
}

.advisor-subtitle {
  font-size: 0.95rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
  max-width: 480px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ─── Disclaimer ─────────────────────────────────── */
.disclaimer-strip {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.1);
  border: 1px solid rgba(var(--v-theme-warning), 0.08);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 18px;
}

/* ─── Glass card ─────────────────────────────────── */
.glass-card {
  background: rgba(var(--v-theme-surface), 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 20px;
  overflow: hidden;
}

/* ─── Input card ─────────────────────────────────── */
.input-card {
  margin-bottom: 20px;
  transition: all 0.4s ease;
}

.quota-banner {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.08);
  border-bottom: 1px solid rgba(var(--v-theme-error), 0.2);
  padding: 10px 16px;
}

.advisor-textarea {
  padding: 16px 16px 0;
}

.advisor-textarea :deep(.v-field__input) {
  font-size: 0.97rem;
  line-height: 1.65;
  color: rgb(var(--v-theme-on-surface));
  min-height: 80px;
}

.advisor-textarea :deep(.v-field) {
  background: transparent !important;
  box-shadow: none !important;
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px 14px;
}

.char-hint {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.35);
  transition: color 0.2s;
}

.char-warn { color: rgb(var(--v-theme-warning)) !important; }

/* ─── Ask Button ─────────────────────────────────── */
.ask-btn {
  font-weight: 700;
  font-size: 0.875rem;
  letter-spacing: 0;
  border-radius: 12px !important;
  padding: 0 20px !important;
  height: 42px !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* ─── Loading card ───────────────────────────────── */
.loading-card {
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.loading-signal {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  animation: pulse-dot 1.4s ease-in-out infinite;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse-dot {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
  40%           { transform: scale(1.1); opacity: 1; }
}

.loading-label {
  font-size: 0.82rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  letter-spacing: 0.05em;
}

/* ─── Error strip ────────────────────────────────── */
.error-strip {
  display: flex;
  align-items: center;
  font-size: 0.83rem;
  font-weight: 600;
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.08);
  border: 1px solid rgba(var(--v-theme-error), 0.2);
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

/* ─── Response card ──────────────────────────────── */
.response-card {
  padding: 0;
  margin-bottom: 20px;
}

.response-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 0;
}

.response-badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 100px;
  padding: 4px 10px;
}

.dismiss-btn {
  opacity: 0.4;
}

.response-text {
  font-size: 0.93rem;
  line-height: 1.75;
  color: rgba(var(--v-theme-on-surface), 0.85);
  padding: 14px 18px;
  white-space: pre-wrap;
}

/* ─── Medications ────────────────────────────────── */
.meds-section {
  padding: 0 18px 18px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.07);
  margin-top: 4px;
  padding-top: 14px;
}

.meds-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin-bottom: 10px;
}

.meds-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.med-chip {
  display: inline-flex;
  align-items: center;
  font-size: 0.82rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid rgba(var(--v-theme-primary), 0.22);
  border-radius: 100px;
  padding: 5px 14px;
  animation: pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.chip-icon { color: rgb(var(--v-theme-primary)); }

.no-meds-notice {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
  padding: 0 18px 18px;
}

/* ─── Transitions ────────────────────────────────── */
.fade-up-enter-active {
  transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(18px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes pop-in {
  from { opacity: 0; transform: scale(0.82); }
  to   { opacity: 1; transform: scale(1); }
}
</style>