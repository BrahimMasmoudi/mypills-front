<template>
  <v-dialog
    v-model="isActive"
    width="550"
    :persistent="isPersistent"
    :scrim="scrim"
  >
    <v-card class="rounded-xl overflow-hidden elevation-24 border-0">

      <v-sheet
        :color="$colorMode.value === 'dark' ? 'surface' : 'primary'"
        class="pt-4 pl-4 pr-0 pb-12 text-white position-relative"
      >
        <div class="d-flex justify-space-between align-start z-index-2 position-relative">
          <div class="w-100 d-flex flex-column">
            <div class="d-flex align-center justify-space-between">
              <div class="text-overline opacity-80 mb-1 mt-1">{{ data.details?.company }}</div>
              <v-btn
                icon="mdi-close"
                variant="text"
                color="white"
                @click="close"
              />
            </div>
            <h2 class="text-h5 font-weight-black leading-tight mt-2 pr-4">
              {{ data.name }}
            </h2>
          </div>
        </div>
        <v-icon
          icon="mdi-pill"
          class="position-absolute"
          style="right: -20px; bottom: 0px; font-size: 140px; opacity: 0.1; transform: rotate(-20deg);"
        />
      </v-sheet>

      <v-card-text class="pa-6 pb-0 bg-surface content-sheet">
        <v-card variant="flat" class="rounded-lg border mb-6 pa-4">
          <div class="text-subtitle-2 font-weight-bold text-primary mb-3 d-flex align-center">
            <v-icon icon="mdi-molecule" class="mr-2" size="20"/>
            {{ t('detailsDialog.substances') }}
          </div>
          <div
            v-for="comp in details?.ingredients"
            :key="comp.substance"
            class="d-flex justify-space-between align-center mb-1"
          >
            <div>
              <div class="text-body-1 font-weight-bold leading-tight">{{ comp.substance }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('detailsDialog.activeComponent') }}</div>
            </div>
            <div class="text-h6 font-weight-black text-primary">{{ comp.dosage }}</div>
          </div>
        </v-card>

        <v-row dense class="mb-4">
          <v-col cols="6">
            <v-card variant="outlined" class="pa-4 rounded-lg bg-surface border-light h-100">
              <suspense>
                <nuxt-icon name="cup" class="text-medium-emphasis d-block oral"/>
              </suspense>
              <div class="text-caption text-medium-emphasis">{{ t('detailsDialog.method') }}</div>
              <div class="text-body-2 font-weight-bold capitalize">{{ details?.administrationRoutes?.[0] }}</div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card variant="outlined" class="pa-4 rounded-lg bg-surface border-light h-100">
              <v-icon
                icon="mdi-form-select"
                color="medium-emphasis"
                size="24"
                class="mb-2"
              />
              <div class="text-caption text-medium-emphasis">{{ t('detailsDialog.form') }}</div>
              <div class="text-body-2 font-weight-bold capitalize">{{ details?.form }}</div>
            </v-card>
          </v-col>
        </v-row>

        <v-row dense class="mb-6">
          <v-col cols="12">
            <v-card variant="outlined" class="pa-4 rounded-lg bg-surface border-light">
              <div class="d-flex align-center">
                <v-icon
                  icon="mdi-pill"
                  color="medium-emphasis"
                  size="24"
                  class="mr-3"
                />
                <div>
                  <div class="text-caption text-medium-emphasis">{{ t('meds.quantity') }}</div>
                  <div class="text-body-2 font-weight-bold">
                    {{ displayQuantity }} {{ getTranslatedForm(displayQuantity, details?.form) || t('meds.pills', displayQuantity) }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <div
          v-if="mainPresentation"
          class="rounded-lg pa-4 d-flex align-center justify-space-between mb-6 info-banner bg-surface"
        >
          <div class="d-flex align-center">
            <v-icon
              icon="mdi-cash-check"
              color="secondary"
              class="mr-3"
              size="28"
            />
            <div>
              <div class="text-caption opacity-80 font-weight-bold uppercase leading-tight">
                {{ t('detailsDialog.refund') }}
              </div>
              <div class="text-body-1 font-weight-bold">
                {{ mainPresentation.refundRate }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-h5 font-weight-black">{{ mainPresentation.price }} €</div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-6 pt-2 bg-surface">
        <v-btn
          block
          color="primary"
          variant="flat"
          height="52"
          rounded="lg"
          class="text-none font-weight-bold"
          @click="handleClose"
        >
          {{ t('close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Medication } from '~/types/medication';

const props = defineProps<{
  close: (value?: any) => void
  isPersistent: boolean
  scrim: boolean
  data: Medication
}>()

const { t } = useI18n()
const isActive = ref(true)
const details = computed(() => props.data.details)
const mainPresentation = computed(() => details.value?.presentations?.[0])

const handleClose = () => {
  isActive.value = false
  props.close()
}

const displayQuantity = computed(() => props.data.unitsPerBox || props.data.quantity)

const getTranslatedForm = (count: number, form?: string) => {
  if (!form) return ''
  const key = form.toLowerCase().split(' ')[0]
  const text = t(`forms.${key}`, count)
  return text === `forms.${key}` ? form : text
}
</script>

<style scoped>
.capitalize {
  text-transform: capitalize;
}

.z-index-2 {
  z-index: 2;
}

.admin-details :deep(.v-expansion-panel-text__wrapper) {
  padding: 8px 0;
}

.border-light {
  border-color: rgba(var(--v-border-color), 0.08) !important;
}

.v-btn {
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Roboto, sans-serif;
  font-size: 1rem;
  font-style: normal;
  line-height: normal;
  letter-spacing: 0.27px;
}

.info-banner {
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.content-sheet {
  margin-top: -24px; /* Pulls it up into the header */
  border-top-left-radius: 28px !important;
  border-top-right-radius: 28px !important;
  position: relative;
  z-index: 5;
  box-shadow: 0 -10px 20px rgba(0,0,0,0.05); /* Soft shadow above the sheet */
}

.dark-mode .content-sheet {
  box-shadow: 0 -10px 20px rgba(0,0,0,0.2);
}

/* Responsive leading for titles */
.leading-tight { line-height: 1.25; }

/* Nuxt Icon Support */
:deep(.nuxt-icon svg) {
  fill: currentColor !important;
  display: block;
}

.oral :deep(svg) {
  width: 24px;
  height: 24px;
  margin-bottom: 10px;
}
</style>