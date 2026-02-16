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
      data-cy="create-medication-dialog"
  >
    <v-card class="rounded-xl pa-6" elevation="24">
      <!-- Header -->
      <div class="d-flex flex-column align-center text-center mb-6">
        <v-avatar color="primary-lighten-5" size="64">
          <v-icon icon="mdi-pill" color="primary" size="46"/>
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
          <v-combobox
              v-model="medication.name"
              :items="tunisianMeds"
              :loading="searchLoading"
              v-model:search="searchQuery"
              @update:search="onSearchChange"
              @update:model-value="onMedicationSelect"
              item-title="name"
              item-value="id"
              :label="t('dialogCreate.medicationLabel')"
              variant="outlined"
              hide-details="auto"
              rounded="lg"
              class="font-weight-medium"
              data-cy="medication-name-input"
              no-filter
              return-object
          >
            <template v-slot:no-data>
              <v-list-item @click="handleCustomName">
                <v-list-item-title>
                  {{ t('dialogCreate.noResults') }} "<strong>{{ searchQuery }}</strong>"
                </v-list-item-title>
                <template v-slot:append>
                  <v-icon icon="mdi-plus" color="primary"/>
                </template>
              </v-list-item>
            </template>

            <template v-slot:selection="{ item }">
              <v-chip
                  v-if="item"
                  color="primary"
                  size="small"
                  class="font-weight-bold"
                  closable
                  @click:close="medication.name = null as any"
              >
                <v-icon icon="mdi-pill" class="mr-2" size="14"></v-icon>
                {{ typeof item.raw === 'object' ? item.raw.name : item.raw }}
              </v-chip>
            </template>

            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :subtitle="item.raw.details?.form">
              </v-list-item>
            </template>

            <template v-slot:append-inner>
              <v-tooltip v-if="selectedCountry === 'FR'" location="top" text="Scan Barcode">
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
          </v-combobox>

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
                  data-cy="expiry-date-input"
                  class="font-weight-medium cursor-pointer elegant-input"
              >
                <template #loader>
                  <v-progress-linear
                      :active="searchLoading"
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
                :max="new Date(new Date().getFullYear() + 17, 11, 31)"
                :year="new Date().getFullYear()"
                @update:model-value="dateMenuIsOpen = false"
                hide-header
                rounded="lg"
                style="color: rgb(var(--v-theme-primary)) !important"
                @update:year="updateYear"
                @update:view-mode="updateViewMode"
                @update:month="updateMonth"/>
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
              data-cy="quantity-input"
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
            :disabled="!medication.name"
            data-cy="confirm-create-button"
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
          <v-icon icon="mdi-pill" color="primary" size="48"/>
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
        <v-combobox
            v-model="medication.name"
            :items="tunisianMeds"
            :loading="searchLoading"
            v-model:search="searchQuery"
            @update:search="onSearchChange"
            @update:model-value="onMedicationSelect"
            item-title="name"
            item-value="id"
            :label="t('dialogCreate.medicationLabel')"
            variant="outlined"
            hide-details="auto"
            rounded="lg"
            class="font-weight-medium"
            no-filter
            return-object
        >
          <template v-slot:no-data>
            <v-list-item @click="handleCustomName">
              <v-list-item-title>
                {{ t('dialogCreate.noResults') }} "<strong>{{ searchQuery }}</strong>"
              </v-list-item-title>
              <template v-slot:append>
                <v-icon icon="mdi-plus" color="primary"/>
              </template>
            </v-list-item>
          </template>

          <template v-slot:selection="{ item }">
            <v-chip
                v-if="item"
                color="primary"
                size="small"
                class="font-weight-bold"
                closable
                @click:close="medication.name = null"
            >
              <v-icon icon="mdi-pill" class="mr-2" size="14"></v-icon>
              {{ typeof item.raw === 'object' ? item.raw.name : item.raw }}
            </v-chip>
          </template>

          <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props" :subtitle="item.raw.details?.form">
            </v-list-item>
          </template>

          <template v-slot:append-inner>
            <v-tooltip v-if="selectedCountry === 'FR'" location="top" text="Scan Barcode">
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
        </v-combobox>

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
                    :active="searchLoading"
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
              :max="new Date(new Date().getFullYear() + 17, 11, 31)"
              @update:model-value="dateMenuIsOpen = false"
              hide-header
              rounded="lg"
              style="color: rgb(var(--v-theme-primary)) !important"
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
  <ScannerDialog v-model="isScannerOpen" @detect="onBarcodeDetected"/>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n"
import {useMedicationsStore} from "~/store/medications"
import {useBarcodeParser} from "~/composables/useBarcodeParser"
import {openToast} from "~/composables/openToast"
import type {Medication} from "~/types/medication"
import {format} from 'date-fns'
import {fr, enUS} from 'date-fns/locale'
import ScannerDialog from "~/components/molecules/ScannerDialog.vue"
import DuplicateConfirmDialog from "~/components/molecules/DuplicateConfirmDialog.vue"
import type {Country} from "~/types/country"
import {useTunisianMedicationsStore} from "~/store/tunisian_medications"
import type {GetMedicationDetailsResponse} from "~/types/api"

const {t, locale} = useI18n()
const {$device, $open} = useNuxtApp()

const locales: Record<string, any> = {en: enUS, fr: fr}

const isActive = ref(true)
const loading = ref(false)

const dateMenuIsOpen = ref(false)
const isScannerOpen = ref(false)

const searchLoading = ref(false)
const searchQuery = ref('')

const tunisianMedicationStore = useTunisianMedicationsStore()

const tunisianMeds = ref<GetMedicationDetailsResponse[]>([])

const {close, createMedication, userUid, email, medications, selectedCountry} = defineProps<{
  close: (value: QueueToastType) => void
  isPersistent: boolean
  scrim: boolean
  createMedication: (medication: Medication) => Promise<void>
  userUid: string
  email: string
  medications: Medication[],
  selectedCountry: Country,
}>()

const medication = ref<Medication>({
  expiryDate: new Date(),
  uid: userUid,
  expired: false,
  quantity: 1,
  name: null as any,
  bareCode: '',
  medicationId: crypto.randomUUID(),
  image: "pill-1",
  email,
  createdAt: new Date(),
  updatedAt: new Date(),
})

const viewMode = ref<"month" | "months" | "year">('year')
const selectedYear = ref()
const selectedMonth = ref()

const updateViewMode = (mode: 'year' | 'months') => {
  viewMode.value = mode === 'year' ? 'year' : 'months'
}

const updateYear = (year: number) => {
  selectedYear.value = year
}

const updateMonth = (month: number) => {
  selectedMonth.value = month
  dateMenuIsOpen.value = false
  medication.value.expiryDate = new Date(selectedYear.value, selectedMonth.value)
}

const formatDate = (date: Date | string) => {
  if (!date) return ''
  return format(new Date(date), 'MMMM yyyy', {locale: locales[locale.value] || enUS})
}

// Barcode Handling
const onBarcodeDetected = async (code: string) => {
  searchLoading.value = true
  try {
    // 1. Parse Code
    const {parseBarcode} = useBarcodeParser()
    const {cip13, expiryDate} = parseBarcode(code)

    if (expiryDate) {
      medication.value.expiryDate = expiryDate
      const year = expiryDate.getFullYear()
      const month = expiryDate.getMonth()

      // Sync picker internal state if needed
      selectedYear.value = year
      selectedMonth.value = month
    }

    if (!cip13) {
      console.warn('No valid CIP13 found in code:', code)
      searchLoading.value = false
      return
    }

    // 2. Call Backend via Store
    const medicationsStore = useMedicationsStore()
    const data = await medicationsStore.getMedicationDetails(cip13)


    if (!data) {
      console.warn('Backend lookup failed: No data returned')
      openToast('error', t('scanner.not_found_message'))
    } else {
      medication.value.bareCode = cip13
      medication.value.name = data.name
      medication.value.details = data.details

      // 3. Check for duplicate medication
      const duplicate = medicationsStore.findDuplicateMedication(
          medications,
          data.name,
          medication.value.expiryDate
      )

      if (duplicate) {
        // Duplicate found - show confirmation dialog
        const result = await $open<string>(DuplicateConfirmDialog, {
          scrim: true,
          isPersistent: true,
          medicationName: data.name,
          expiryDate: medication.value.expiryDate
        })

        if (result === 'increment') {
          // Increment by the quantity of the scanned/selected medication (e.g., 30)
          await medicationsStore.incrementPills(duplicate, medication.value.quantity)
          openToast('success', t('success'))
          close('success')
        } else {
          medication.value.name = null
          medication.value.expiryDate = new Date()
        }
      } else {
        medication.value.quantity = data.details.quantity || 1
        await performCreation()
      }
    }
  } catch (e: any) {
    console.error('Barcode lookup error:', e)
    openToast('error', t('scanner.not_found_message'))
  } finally {
    searchLoading.value = false
    isScannerOpen.value = false
  }
}

const performCreation = async () => {
  medication.value.expiryDate = new Date(medication.value.expiryDate)
  try {
    loading.value = true
    medication.value.quantity = Number(medication.value.quantity)
    await createMedication(medication.value)
    loading.value = false
    close('success')
  } catch (e) {
    loading.value = false
    close('error')
  }
}

const onConfirmClick = async () => {
  await performCreation()
}

const cancelAndClose = () => close('canceled')

const debouncer = useDebounceFn(async (query: string) => {
  if (!query || query.length < 2) {
    tunisianMeds.value = []
    return
  }
  tunisianMeds.value = await tunisianMedicationStore.searchTunisianMedications(query)
}, 200)

const onSearchChange = (query: string) => {
  if (query) {
    debouncer(query)
  }
}

const handleCustomName = () => {
  if (!searchQuery.value) return
  medication.value.name = searchQuery.value
  medication.value.details = undefined
  medication.value.bareCode = ''
  tunisianMeds.value = []
}

const onMedicationSelect = (val: any) => {
  if (!val) return

  if (typeof val === 'object' && val.name) {
    medication.value.name = val.name
    medication.value.details = val.details

    medication.value.quantity = val.details?.quantity || 1
  } else if (typeof val === 'string') {
    medication.value.name = val
    medication.value.details = undefined
  }
}
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

:deep(.v-combobox__menu-icon) {
  display: none !important;
}
</style>