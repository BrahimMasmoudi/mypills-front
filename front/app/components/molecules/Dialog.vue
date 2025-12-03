<template>
  <v-dialog v-if="$device.isDesktop" v-model="isActive"
            :persistent="isPersistent"
            :scrim="scrim"
            @keydown.esc="cancelAndClose"
            width="600">
    <suspense>
      <v-card class="border pa-5" variant="flat">

        <v-card-title class="d-flex justify-center pt-0 pl-0 title">
          {{ t('dialogCreate.title') }}
        </v-card-title>
        <v-card-text class="py-0">
          <v-container>
              <!-- Medication Name -->
          <div class="mb-5">
            <v-text-field
                v-model="medication.name"
                :label="t('dialogCreate.medicationLabel')"
                variant="outlined"
                density="comfortable"
                color="primary"
                bg-color="grey-lighten-5"
                hide-details="auto"
                rounded="lg"
                prepend-inner-icon="mdi-pill"
                class="font-weight-medium"
            />
          </div>

          <!-- Expiry Date -->
          <div class="mb-5">
            <v-menu
                v-model="dateMenuIsOpen"
                :close-on-content-click="false"
                transition="scale-transition"
                min-width="auto"
                location="center"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                    v-bind="props"
                    :model-value="formatDate(medication.expiryDate)"
                    :label="t('dialogCreate.choose-date-title')"
                    variant="outlined"
                    density="comfortable"
                    color="primary"
                    bg-color="grey-lighten-5"
                    hide-details="auto"
                    rounded="lg"
                    prepend-inner-icon="mdi-calendar"
                    readonly
                    class="font-weight-medium cursor-pointer"
                />
              </template>
                      <v-date-picker  :view-mode="viewMode"
                                          elevation="4"
                                          :min="new Date()"
                                          @update:model-value="dateMenuIsOpen = false"
                                          hide-header
                                          rounded="lg"
                                          style="color: rgb(var(--v-theme-primary)) !important;"
                                          @update:year="updateYear"
                                          @update:view-mode="updateViewMode"
                                          @update:month="updateMonth"
                                        />
            </v-menu>
          </div>

          <!-- Quantity -->
          <div>
            <v-text-field
                v-model.number="medication.quantity"
                :label="t('dialogCreate.quantity')"
                type="number"
                variant="outlined"
                density="comfortable"
                color="primary"
                bg-color="grey-lighten-5"
                hide-details="auto"
                rounded="lg"
                prepend-inner-icon="mdi-counter"
                min="1"
                class="font-weight-medium"
            />
          </div>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-btn class="mx-auto"
                 height="45"
                 style="font-weight: 700;border-radius: 4px;border: 1px solid #DDD;background: #FFF;"
                 @click="cancelAndClose"
                 variant="outlined"
                 width="200">
         <span class="confirm text-primary">
             {{ t('cancel') }}
         </span>
          </v-btn>
          <v-btn class="mx-auto"
                 color="primary"
                 height="45"
                 style="font-weight: 700;"
                 :loading="loading"
                 variant="flat"
                 @click="onConfirmClick"
                 width="200">
         <span class="confirm">
             {{ t('confirm') }}
         </span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </suspense>
  </v-dialog>
  
  <v-dialog v-else v-model="isActive"
            :persistent="isPersistent"
            :scrim="scrim"
            @keydown.esc="cancelAndClose">
    <suspense>
      <v-card class="border pa-8" variant="flat">

        <v-card-title class="d-flex justify-center pt-0 pl-0 title-mobile">
          {{ t('dialogCreate.title') }}
        </v-card-title>
        <v-card-text class="pa-0">
          <v-container>
            <div class="mb-5">
            <v-text-field
                v-model="medication.name"
                :label="t('dialogCreate.medicationLabel')"
                variant="outlined"
                density="comfortable"
                color="primary"
                bg-color="grey-lighten-5"
                hide-details="auto"
                rounded="lg"
                prepend-inner-icon="mdi-pill"
                class="font-weight-medium"
            />
          </div>

          <!-- Expiry Date -->
          <div class="mb-5">
            <v-menu
                v-model="dateMenuIsOpen"
                :close-on-content-click="false"
                transition="scale-transition"
                min-width="auto"
                location="center"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                    v-bind="props"
                    :model-value="formatDate(medication.expiryDate)"
                    :label="t('dialogCreate.choose-date-title')"
                    variant="outlined"
                    density="comfortable"
                    color="primary"
                    bg-color="grey-lighten-5"
                    hide-details="auto"
                    rounded="lg"
                    prepend-inner-icon="mdi-calendar"
                    readonly
                    class="font-weight-medium cursor-pointer"
                />
              </template>
                      <v-date-picker  :view-mode="viewMode"
                                          elevation="4"
                                          :min="new Date()"
                                          @update:model-value="dateMenuIsOpen = false"
                                          hide-header
                                          rounded="lg"
                                          style="color: rgb(var(--v-theme-primary)) !important;"
                                          @update:year="updateYear"
                                          @update:view-mode="updateViewMode"
                                          @update:month="updateMonth"
                                        />
            </v-menu>
          </div>

          <!-- Quantity -->

            <v-text-field
                v-model.number="medication.quantity"
                :label="t('dialogCreate.quantity')"
                type="number"
                variant="outlined"
                density="comfortable"
                color="primary"
                bg-color="grey-lighten-5"
                hide-details="auto"
                rounded="lg"
                prepend-inner-icon="mdi-counter"
                min="1"
                class="font-weight-medium"
            />
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-btn class="mx-auto"
                 height="45"
                 style="font-weight: 700;border-radius: 4px;border: 1px solid #DDD;background: #FFF;"
                 @click="cancelAndClose"
                 variant="outlined"
                 width="120">
         <span class="confirm text-primary">
             {{ t('cancel') }}
         </span>
          </v-btn>
          <v-btn class="mx-auto"
                 color="primary"
                 height="45"
                 style="font-weight: 700;"
                 :loading="loading"
                 variant="flat"
                 @click="onConfirmClick"
                 width="120">
         <span class="confirm">
             {{ t('confirm') }}
         </span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </suspense>
  </v-dialog>
</template>
<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import type {Medication} from "~/types/medication";
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

const {t, locale} = useI18n()
const {$device} = useNuxtApp()

const locales: Record<string, any> = { en: enUS, fr: fr };


const isActive = ref(true)
const loading = ref(false)
const dateMenuIsOpen = ref(false)

const {close, createMedication,userUid, email} = defineProps<{
  close: (value : ToastType) => void
  isPersistent: boolean
  scrim: boolean
  createMedication: (medication: Medication) => Promise<void>
  userUid : string
  email : string
}>()
const medication = ref<Medication>({
  expiryDate: new Date(),
  uid: userUid,
  expired: false,
  quantity: 1,
  name: 'médicament',
  bareCode: '',
  medicationId: crypto.randomUUID(),
  image: "pill-1",
  email
})

 const viewMode = ref<"month" | "months" | "year">('year')
  const selectedYear = ref()
  const selectedMonth = ref()

  const updateViewMode = (mode : 'year' | 'months') => {
    viewMode.value = mode === 'year' ? 'year' : 'months'
  }

  const updateYear = (year : number) => {
    selectedYear.value = year
  }

  const updateMonth = (month : number) => {
    selectedMonth.value = month
    dateMenuIsOpen.value = false
    medication.value.expiryDate = new Date(selectedYear.value, selectedMonth.value)
  }

  const formatDate = (date: Date | string) => {
  if (!date) return '';
  return format(new Date(date), 'MMMM yyyy', { locale: locales[locale.value] || enUS });
}


const onConfirmClick = async () => {
  medication.value.expiryDate = new Date(medication.value.expiryDate)
  // Assign random pill icon from pill-1 to pill-30
  const randomIconNumber = Math.floor(Math.random() * 30) + 1
  medication.value.image = `pill-${randomIconNumber}`
  
  try {
    loading.value = true
    medication.value.quantity = Number(medication.value.quantity)
    await createMedication(medication.value)
    loading.value = false
    close('success')
  } catch (e) {
    close('error')
  }
}

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
  font-size: 1rem !important;
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

.confirm {
  font-feature-settings: 'clig' off, 'liga' off !important;
  font-family: Roboto, sans-serif !important;
  font-size: 1rem !important;
  font-style: normal !important;
  font-weight: 700 !important;
  line-height: normal !important;
  letter-spacing: 0.27px !important;
}

.icon {
  cursor: pointer;
}

.icon >>> svg {
  width: 48px !important;
  height: 48px !important;
}

.icon-mobile {
  cursor: pointer;
}

.icon-mobile >>> svg {
  width: 36px !important;
  height: 36px !important;
}

.selected-icon >>> svg {
  width: 36px !important;
  height: 36px !important;
}

</style>