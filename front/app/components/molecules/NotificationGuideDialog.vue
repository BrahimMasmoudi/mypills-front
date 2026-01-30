<template>
  <v-dialog
      v-model="isActive"
      :persistent="isPersistent"
      :scrim="scrim"
      :width="$device.isDesktop ? 450 : '100%'"
      :class="!$device.isDesktop ? 'align-end ma-0' : ''"
      content-class="elevation-0"
  >
    <v-card :class="[$device.isDesktop ? 'rounded-xl' : 'rounded-t-xl', 'pa-6 pb-8']">
      <v-sheet v-if="!$device.isDesktop" color="grey-lighten-2" height="4" width="40" class="rounded-pill mx-auto mb-6"/>

      <div class="d-flex flex-column align-center text-center">
        <v-avatar color="warning-lighten-5" size="64" class="mb-4">
          <v-icon icon="mdi-bell-alert" color="warning" size="36"/>
        </v-avatar>

        <v-card-title class="text-h5 font-weight-bold pt-0 pb-1 text-wrap">
          {{ t('guideDialog.title') }}
        </v-card-title>

        <div class="text-body-2 text-medium-emphasis px-4 mb-4 text-left">
          <p class="mb-4">{{ t('guideDialog.subtitle') }}</p>

          <div class="d-flex align-start mb-2">
            <v-icon icon="mdi-numeric-1-circle" color="primary" class="mr-2" />
            <span>{{ t('guideDialog.step1') }}</span>
          </div>
          <div class="d-flex align-start mb-2">
            <v-icon icon="mdi-numeric-2-circle" color="primary" class="mr-2" />
            <span>{{ t('guideDialog.step2') }}</span>
          </div>
          <div class="d-flex align-start">
            <v-icon icon="mdi-numeric-3-circle" color="primary" class="mr-2" />
            <span>{{ t('guideDialog.step3') }}</span>
          </div>
        </div>

        <v-checkbox
            v-model="dontShowAgain"
            :label="t('guideDialog.dontShowAgain')"
            color="primary"
            hide-details
            density="comfortable"
            class="mb-4"
        />

        <v-btn
            block
            color="primary"
            variant="flat"
            size="large"
            height="52"
            class="text-none font-weight-bold rounded-lg"
            @click="confirm"
        >
          {{ t('guideDialog.understand') }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";

const { t } = useI18n()
const { $device } = useNuxtApp()

const props = defineProps<{
  close: (dontShow: boolean) => void
  isPersistent: boolean
  scrim: boolean
}>()

const isActive = ref(true)
const dontShowAgain = ref(false)

const confirm = () => {
  isActive.value = false
  // Return the checkbox value to the caller
  props.close(dontShowAgain.value)
}
</script>