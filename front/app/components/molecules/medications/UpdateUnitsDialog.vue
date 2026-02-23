<template>
  <v-dialog
    v-model="isActive"
    :persistent="isPersistent"
    :scrim="scrim"
    :class="$device.isMobile ? 'align-end ma-0' : ''"
    width="400"
    content-class="elevation-0"
  >
    <v-card class="rounded-xl pa-0 d-flex flex-column" elevation="24">
      <div class="pa-6 pb-0">
        <v-sheet
          v-if="$device.isMobile"
          color="grey-lighten-2 mx-auto"
          height="4"
          width="40"
          class="rounded-pill mb-6"
        />

        <div class="d-flex flex-column align-center text-center mb-4">
          <v-avatar color="primary-lighten-5" size="64" class="mb-4">
            <v-icon icon="mdi-package-variant-closed" color="primary" size="32"/>
          </v-avatar>
          <v-card-title class="text-h5 font-weight-bold pt-0">
            {{ t('dialogUpdateUnits.title') || 'Box Size' }}
          </v-card-title>
          <div class="text-body-2 text-medium-emphasis">
            {{ t('dialogUpdateUnits.subtitle') || 'Update the number of pills per box' }}
          </div>
        </div>
      </div>

      <v-card-text class="pa-6">
        <v-text-field
          v-model.number="units"
          type="number"
          :label="t('dialogUpdateUnits.label') || 'Pills per box'"
          variant="outlined"
          rounded="lg"
          class="font-weight-bold text-h6"
          prepend-inner-icon="mdi-pill"
          :rules="[v => v > 0 || 'Must be greater than 0']"
          autofocus
        />
      </v-card-text>

      <v-divider/>

      <v-card-actions class="pa-6 gap-3">
        <v-btn
          variant="outlined"
          size="large"
          color="grey-darken-1"
          class="flex-grow-1 text-capitalize font-weight-bold"
          height="48"
          @click="cancel"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          class="flex-grow-1 text-capitalize font-weight-bold"
          height="48"
          :loading="loading"
          :disabled="!isValid"
          @click="confirm"
        >
          {{ t('confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Medication } from '~/types/medication'
import { useMedicationsStore } from '~/store/medications'

const { $device } = useNuxtApp()
const { t } = useI18n()
const store = useMedicationsStore()

const props = defineProps<{
  close: (value: string) => void
  isPersistent: boolean
  scrim: boolean
  medication: Medication
}>()

const isActive = ref(true)
const loading = ref(false)
const units = ref(props.medication.unitsPerBox || 1)

const isValid = computed(() => units.value > 0)

const confirm = async () => {
  if (!isValid.value) return

  loading.value = true
  try {
    await store.updateMedication(props.medication, 'unitsPerBox', units.value)
    props.close('success')
  } catch (e) {
    console.error(e)
    props.close('error')
  } finally {
    loading.value = false
  }
}

const cancel = () => {
  props.close('canceled')
}
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
