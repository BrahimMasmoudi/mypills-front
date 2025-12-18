<template>
  <v-dialog v-model="isActive"
            :persistent="isPersistent"
            :scrim="scrim"
            max-width="400"
            @update:modelValue="close">
    <v-card class="rounded-xl pa-6">
      <!-- Header -->
      <div class="d-flex flex-column align-center text-center mb-4">
        <v-avatar color="warning-lighten-4" size="64" class="mb-3">
          <v-icon icon="mdi-alert-circle-outline" color="warning" size="36" />
        </v-avatar>
        <v-card-title class="text-h6 font-weight-bold pa-0">
          {{ t('duplicate.title') }}
        </v-card-title>
      </div>

      <!-- Message -->
      <v-card-text class="pa-0 text-center mb-6">
        <p class="text-body-1">
          {{ t('duplicate.message', { name: medicationName, date: formattedDate }) }}
        </p>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-0 d-flex flex-column gap-3">
        <v-btn
            block
            color="primary"
            variant="flat"
            size="large"
            class="text-capitalize font-weight-bold"
            @click="close('increment')">
          {{ t('duplicate.increment') }}
        </v-btn>
        <v-btn
            block
            variant="outlined"
            color="grey-darken-1"
            size="large"
            class="text-capitalize font-weight-bold"
            @click="close('cancel')">
          {{ t('duplicate.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n"
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

const { t, locale } = useI18n()

const locales: Record<string, any> = { en: enUS, fr: fr }

const isActive = ref(true)

const { close, medicationName, expiryDate } = defineProps<{
  close: (returnValue?: any) => void
  isPersistent: boolean
  scrim: boolean
  medicationName: string
  expiryDate: Date
}>()

const formattedDate = computed(() => {
  return format(expiryDate, 'MMMM yyyy', { locale: locales[locale.value] || enUS })
})
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
