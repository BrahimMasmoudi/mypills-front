<template>
  <v-dialog
      v-if="$device.isDesktop"
      v-model="isActive"
      :persistent="isPersistent"
      :scrim="scrim"
      width="450"
      content-class="elevation-0"
  >
    <v-card class="rounded-xl pa-6" elevation="24">
      <div class="d-flex flex-column align-center text-center mb-6">
        <v-avatar color="blue-lighten-5" size="64" class="mb-4">
          <v-icon icon="mdi-map-marker-radius" color="primary" size="36"/>
        </v-avatar>
        <v-card-title class="text-h5 font-weight-bold pt-0 pb-1">
          {{ t('countryDialog.title') }}
        </v-card-title>
        <div class="text-body-2 text-medium-emphasis px-4">
          {{ t('countryDialog.subtitle') }}
        </div>
      </div>

      <v-card-actions class="d-flex flex-column gap-3 px-0">
        <v-btn
            block
            color="primary"
            variant="flat"
            size="large"
            height="52"
            class="text-none font-weight-bold rounded-lg"
            @click="confirm('FR')"
        >
          {{ t('countryDialog.confirmFr') }}
        </v-btn>

        <v-btn
            block
            variant="outlined"
            color="primary"
            height="52"
            class="text-none font-weight-bold"
            @click="confirm(null)"
        >
          {{ t('countryDialog.confirmElseWhere') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
      v-else
      v-model="isActive"
      :persistent="isPersistent"
      :scrim="scrim"
      width="100%"
      class="align-end ma-0"
  >
    <v-card class="rounded-t-xl pa-6 pb-8">
      <div class="d-flex flex-column align-center text-center">
        <v-sheet color="grey-lighten-2" height="4" width="40" class="rounded-pill mb-6"/>

        <v-avatar color="blue-lighten-5" size="56" class="mb-3">
          <v-icon icon="mdi-map-marker-radius" color="primary" size="32"/>
        </v-avatar>

        <h3 class="text-h6 font-weight-bold mb-2">{{ t('countryDialog.title') }}</h3>
        <p class="text-body-2 text-medium-emphasis mb-8">
          {{ t('countryDialog.subtitle') }}
        </p>

        <v-btn
            block
            color="primary"
            variant="flat"
            size="x-large"
            class="text-none font-weight-bold rounded-lg mb-3"
            @click="confirm('FR')"
        >
          {{ t('countryDialog.confirmFr') }}
        </v-btn>

        <v-btn
            block
            variant="text"
            color="grey-darken-1"
            class="text-none font-weight-bold"
            @click="confirm(null)"
        >
          {{ t('countryDialog.confirmElseWhere') }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {useI18n} from 'vue-i18n'

const {t} = useI18n()
const {$device} = useNuxtApp()

const props = defineProps<{
  close: (value: string | null) => void
  isPersistent: boolean
  scrim: boolean
}>()

const isActive = ref(true)

const confirm = (value: string | null) => {
  isActive.value = false
  props.close(value)
}
</script>
<style scoped>
.v-btn {
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Roboto, sans-serif;
  font-size: 1rem;
  font-style: normal;
  line-height: normal;
  letter-spacing: 0.27px;
}
</style>