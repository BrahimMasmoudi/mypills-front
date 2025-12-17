<template>
  <!-- Desktop Layout -->
  <v-dialog
      v-if="$device.isDesktop"
      v-model="isActive"
      :persistent="isPersistent"
      :scrim="scrim"
      @keydown.esc="cancelAndClose"
      width="550"
      content-class="elevation-0"
  >
    <v-card class="rounded-xl pa-6" elevation="24">
      <!-- Header -->
      <div class="d-flex flex-column align-center text-center mb-6">
        <v-avatar color="primary-lighten-5" size="64">
          <v-icon icon="mdi-pill" color="primary" size="46" />
        </v-avatar>
        <v-card-title class="text-h5 font-weight-bold pt-0 pb-1">
          {{ t('dialogCreate.title') }}
        </v-card-title>
        <div class="text-body-2 text-medium-emphasis">
          {{ t('dialogCreate.subtitle') }}
        </div>
      </div>

      <v-card-text class="pa-0">
        <div class="d-flex flex-column gap-4">
          <!-- Medication Name with Scan -->
          <v-text-field
              v-model="medication.name"
              :label="t('dialogCreate.medicationLabel')"
              variant="outlined"
              color="primary"
              prepend-inner-icon="mdi-pill"
              hide-details="auto"
              rounded="lg"
              :loading="scannerIsLoading"
              class="font-weight-medium text-black"
          >
            <template v-slot:loader>
                <v-progress-linear
                  :active="scannerIsLoading"
                  color="primary"
                  height="2"
                  indeterminate
                ></v-progress-linear>
            </template>
            <template v-slot:append-inner>
              <v-tooltip location="top" text="Scan Barcode">
                <template v-slot:activator="{ props }">
                  <v-btn
                      v-bind="props"
                      icon="mdi-barcode-scan"
                      variant="tonal"
                      color="primary"
                      size="small"
                      class="ms-1"
                      @click="isScannerOpen = true"
                  />
                </template>
              </v-tooltip>
            </template>
          </v-text-field>

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
                  color="primary"
                  hide-details="auto"
                  rounded="lg"
                  prepend-inner-icon="mdi-calendar-blank"
                  readonly
                  loading
                  class="font-weight-medium cursor-pointer elegant-input"
              >
                <template v-slot:loader>
                    <v-progress-linear
                      :active="scannerIsLoading"
                      color="primary"
                      height="2"
                      indeterminate
                    ></v-progress-linear>
                </template>
              </v-text-field>
            </template>
            <v-date-picker 
                :view-mode="viewMode"
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

          <!-- Quantity -->
          <v-text-field
              v-model.number="medication.quantity"
              :label="t('dialogCreate.quantity')"
              type="number"
              variant="outlined"
              color="primary"
              hide-details="auto"
              rounded="lg"
              prepend-inner-icon="mdi-pill"
              min="1"
              class="font-weight-medium elegant-input"
          />
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="w-100 justify-center pt-8 gap-3 px-0">
        <v-btn
            variant="outlined"
            size="large"
            color="grey-darken-1"
            class="flex-grow-1 text-capitalize font-weight-bold"
            height="48"
            @click="cancelAndClose"
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
            @click="onConfirmClick"
        >
          {{ t('confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>



  <!-- Mobile Layout (Bottom Sheet) -->
  <v-dialog
      v-else
      v-model="isActive"
      :persistent="isPersistent"
      :scrim="scrim"
      color="transparent"
      width="100%"
      class="align-end ma-0"
      @keydown.esc="cancelAndClose"
  >
    <v-card class="rounded-t-xl pa-5 pb-8" elevation="0">
      <div class="d-flex flex-column align-center text-center mb-6">
        <!-- Drag Handle -->
        <v-sheet
            color="grey-lighten-2"
            height="4"
            width="40"
            class="rounded-pill mb-6"
        />

        <v-avatar color="primary-lighten-5" size="56" class="mb-3">
          <v-icon icon="mdi-pill" color="primary" size="48" />
        </v-avatar>

        <h3 class="text-h6 font-weight-bold mb-1">
          {{ t('dialogCreate.title') }}
        </h3>
        <div class="text-body-2 text-medium-emphasis">
          {{ t('dialogCreate.subtitle') }}
        </div>
      </div>

      <div class="d-flex flex-column gap-4 mb-6">
        <!-- Medication Name -->
        <v-text-field
            v-model="medication.name"
            :label="t('dialogCreate.medicationLabel')"
            variant="outlined"
            color="primary"
            hide-details="auto"
            loading
        >
          <template v-slot:loader>
              <v-progress-linear
                :active="scannerIsLoading"
                color="primary"
                height="2"
                indeterminate
              ></v-progress-linear>
          </template>
          <template v-slot:append-inner>
             <v-btn
                icon="mdi-barcode-scan"
                variant="tonal"
                color="primary"
                size="small"
                class="ms-1"
                @click="isScannerOpen = true"
             />
          </template>
        </v-text-field>

        <!-- Expiry Date -->
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
                color="primary"
                hide-details="auto"
                rounded="lg"
                prepend-inner-icon="mdi-calendar-blank"
                readonly
                loading
                class="font-weight-medium cursor-pointer"
            >
              <template v-slot:loader>
                  <v-progress-linear
                    :active="scannerIsLoading"
                    color="primary"
                    height="2"
                    indeterminate
                  ></v-progress-linear>
              </template>
            </v-text-field>
          </template>
          <v-date-picker 
              :view-mode="viewMode"
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

        <!-- Quantity -->
        <v-text-field
            v-model.number="medication.quantity"
            :label="t('dialogCreate.quantity')"
            type="number"
            variant="outlined"
            color="primary"
            hide-details="auto"
            rounded="lg"
            prepend-inner-icon="mdi-counter"
            min="1"
            class="font-weight-medium"
        />
      </div>

      <!-- Mobile Actions -->
      <div class="d-flex flex-column w-100 gap-3">
        <v-btn
            block
            color="primary"
            variant="flat"
            size="x-large"
            class="text-capitalize font-weight-bold rounded-lg"
            :loading="loading"
            @click="onConfirmClick"
        >
          {{ t('confirm') }}
        </v-btn>

        <v-btn
            block
            variant="text"
            size="large"
            color="grey-darken-1"
            class="text-capitalize font-weight-bold mt-2"
            @click="cancelAndClose"
        >
          {{ t('cancel') }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>

  <!-- Scanner Dialog -->
  <ScannerDialog v-model="isScannerOpen" @detect="onBarcodeDetected" />
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n"
import {useMedicationsStore} from "../../store/medications"
import {useBarcodeParser} from "../../composables/useBarcodeParser"
import type {Medication} from "../../types/medication"
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import ScannerDialog from "~/components/molecules/ScannerDialog.vue";

const {t, locale} = useI18n()
const {$device} = useNuxtApp()

const locales: Record<string, any> = { en: enUS, fr: fr };

const isActive = ref(true)
const loading = ref(false)
const scannerIsLoading = ref(false)
const dateMenuIsOpen = ref(false)
const isScannerOpen = ref(false)

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
  name: '',
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

// Barcode Handling
const onBarcodeDetected = async (code: string) => {
    scannerIsLoading.value = true
    try {
        // 1. Parse Code
        const { parseBarcode } = useBarcodeParser();
        const { cip13, expiryDate } = parseBarcode(code);
        
        if (expiryDate) {
            medication.value.expiryDate = expiryDate;
            const year = expiryDate.getFullYear();
            const month = expiryDate.getMonth();
            
            // Sync picker internal state if needed
            selectedYear.value = year;
            selectedMonth.value = month; 
        }

        if (!cip13) {
            console.warn('No valid CIP13 found in code:', code);
            scannerIsLoading.value = false;
            return;
        }

        // 2. Call Backend via Store
        const medicationsStore = useMedicationsStore();
        const data = await medicationsStore.getMedicationDetails(cip13);

        if (!data) {
            console.warn('Backend lookup failed: No data returned');
        } else {
             medication.value.name = data.name;
        }

    } catch (e: any) {
        console.error('Barcode lookup error:', e);
    } finally {
        scannerIsLoading.value = false
    }
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
.gap-4 {
  gap: 16px;
}
.gap-3 {
  gap: 12px;
}
:deep(.v-field__input) {
  padding-top: 10px;
  padding-bottom: 10px;
  min-height: 56px;
}
</style>