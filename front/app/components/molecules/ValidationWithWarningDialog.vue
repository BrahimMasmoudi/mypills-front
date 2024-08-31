<template>
  <v-dialog v-if="$device.isDesktop" v-model="isActive"
            :persistent="isPersistent"
            :scrim="scrim"
            data-cy="validation-with-warning-dialog"
            @keydown.esc="cancelAndClose"
            :width="width">
    <v-card class="border" style="padding: 48px 72px 0 72px !important;" variant="flat">

      <v-card-title class="d-flex justify-start pt-0 pl-0 pb-4 mb-2 title mx-auto">
        {{ title }}
      </v-card-title>
      <v-card variant="flat" class="mb-8 pa-2 text-red d-flex text-subtitle-2" style="background-color: #D7032124">
        <template #prepend>
          <suspense>
            <nuxt-icon class="small" name="error-warning"/>
          </suspense>
        </template>
        {{ message }}
      </v-card>
      <v-card-actions class="pa-0">
        <v-btn class="mx-auto mb-8"
               height="45"
               style="font-weight: 700;border-radius: 4px;border: 1px solid #DDD;background: #FFF;"
               @click="cancelAndClose"
               variant="outlined"
               width="200">
         <span class="confirm text-primary">
             {{ t('cancel') }}
         </span>
        </v-btn>

        <v-btn class="mx-auto mb-8"
               color="primary"
               height="45"
               style="font-weight: 700;"
               :loading="loading"
               data-cy="confirm-button"
               variant="flat"
               @click="onConfirmClick"
               width="200">
         <span class="confirm">
             {{ t('confirm') }}
         </span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-else v-model="isActive"
            :persistent="isPersistent"
            :scrim="scrim"
            @keydown.esc="cancelAndClose">
    <v-card class="border pa-8" variant="flat">
      <v-card-title class="d-flex justify-center pt-0 pl-0 pb-4 mb-2 title-mobile">
        {{ title }}
      </v-card-title>
      <span class="title-mobile d-flex align-start">
      <b>{{ t('subtitle-list') }}</b>
      </span>
      <v-card variant="flat" class="mb-8 pa-2 text-red d-flex text-subtitle-2" style="background-color: #D7032124">
        <template #prepend>
          <suspense>
            <nuxt-icon class="small" name="error-warning"/>
          </suspense>
        </template>
        {{ message }}
      </v-card>
      <v-card-actions class="pa-0">
        <v-btn class="mx-auto mb-8"
               height="45"
               style="font-weight: 700;border-radius: 4px;border: 1px solid #DDD;background: #FFF;"
               @click="cancelAndClose"
               variant="outlined"
               width="100">
         <span class="confirm text-primary">
             {{ t('cancel') }}
         </span>
        </v-btn>

        <v-btn class="mx-auto mb-8"
               color="primary"
               height="45"
               style="font-weight: 700;"
               :loading="loading"
               data-cy="confirm-button"
               variant="flat"
               @click="onConfirmClick"
               width="100">
         <span class="confirm">
             {{ t('confirm') }}
         </span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import type {ToastType} from "~/composables/openToast";

const {t} = useI18n()
const isActive = ref(true)
const loading = ref(false)
const {close, width = 600} = defineProps<{
  close: (toastType: ToastType) => void
  isPersistent: boolean
  scrim: boolean
  title: string
  message: string
  width?: number
}>()

const onConfirmClick = () => close('success')

const cancelAndClose = () => close('canceled')
</script>
<style scoped>
div:deep(.v-field__input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.title {
  color: #000 !important;
  text-align: center !important;
  font-feature-settings: 'clig' off, 'liga' off !important;
  font-family: Roboto, sans-serif !important;
  font-size: 1.125rem !important;
  font-style: normal !important;
  font-weight: 700 !important;
  line-height: normal !important;
}

.title-mobile {
  color: #000 !important;
  text-align: center !important;
  font-feature-settings: 'clig' off, 'liga' off !important;
  font-family: Roboto, sans-serif !important;
  font-size: 0.825rem !important;
  font-style: normal !important;
  font-weight: 700 !important;
  line-height: normal !important;
}

.confirm {
  font-feature-settings: 'clig' off, 'liga' off !important;
  font-family: Roboto, sans-serif !important;
  font-size: 1rem !important;
  font-style: normal !important;
  font-weight: 700 !important;
  line-height: normal !important;
  letter-spacing: 0.27px !important;
}

div:deep(.v-card-item__append) {
  padding-left: 5px !important;
}

.v-textarea:deep(.v-field__input) {
  margin-top: 10px;
  margin-left: 10px;
  mask-image: none !important;
}

.v-btn {
  text-transform: unset !important;
}

div:deep(.v-field__clearable) {
  padding-top: 10px !important;
}
>>> svg {
  width: 24px !important;
  height: 24px !important;
}
</style>