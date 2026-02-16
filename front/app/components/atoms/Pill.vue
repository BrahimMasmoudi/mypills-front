<template>
  <v-card
      :class="['pill-card', { 'expired-card': medication.expired }]"
      elevation="2"
      rounded="lg"
      data-cy="medication-card"
      class="d-flex flex-column fill-height position-relative feature-card"
      @click="handleCardClick"
  >
    <div class="position-absolute top-0 right-0 ma-1 z-index-1">
      <v-btn
          icon="mdi-delete-outline"
          variant="text"
          color="error"
          size="small"
          density="comfortable"
          data-cy="delete-pill-button"
          :loading="loadingAction === 'delete'"
          :disabled="loadingAction !== null"
          @click.stop="confirmDelete"
      />
    </div>

    <div v-if="medication.bareCode" class="position-absolute top-0 left-0 ma-1 z-index-1">
      <v-btn
          icon="mdi-barcode-scan"
          variant="text"
          size="small"
          color="primary"
          density="comfortable"
          @click.stop="showMedicationDetails"
      />
    </div>
    <div v-else-if="medication.details" class="position-absolute top-0 left-0 ma-1 z-index-1">
      <v-btn
          icon="mdi-information-outline"
          variant="text"
          size="small"
          color="primary"
          density="comfortable"
          @click.stop="showMedicationDetails"
      />
    </div>

    <div
        class="d-flex flex-column align-center flex-grow-1 px-2"
        :class="$device.isMobile ? 'pt-4 pb-2' : 'pt-6 pb-2'"
    >
      <div class="pill-image-container" :class="{'mobile-image': $device.isMobile}">
        <v-avatar
            :color="medication.expired ? 'error' : 'primary'"
            size="48"
            class="elevation-1"
        >
    <span class="text-h5 text-white font-weight-bold">
      {{ medication.name.charAt(0).toUpperCase() }}
    </span>
        </v-avatar>
      </div>

      <div class="w-100 mb-1 position-relative d-flex justify-center">
        <div
            v-if="!isEditing"
            class="d-flex align-center justify-center cursor-pointer name-display py-1 px-2 rounded w-100"
            @click="handleNameClick"
        >
          <span
              class="font-weight-bold text-center"
              :class="[
                  $device.isMobile ? 'text-body-2 text-wrap' : 'text-h6 text-truncate ml-6',
                  {'line-clamp-2': $device.isMobile}
              ]"
          >
            {{ medication.name }}
          </span>
          <v-icon
              v-if="!$device.isMobile || showFooterMobile"
              icon="mdi-pencil"
              size="14"
              class="ml-2 text-medium-emphasis opacity-0 hover-opacity-1 flex-shrink-0"
              :class="{'opacity-100': showFooterMobile}"
          />
        </div>

        <v-text-field
            v-else
            v-model="editedName"
            variant="outlined"
            density="compact"
            hide-details
            class="medication-name-input text-center"
            bg-color="surface"
            autofocus
            single-line
            :loading="loadingAction === 'rename'"
            :disabled="loadingAction === 'rename'"
            @blur="toggleEdit"
            @keydown.enter="toggleEdit"
            @click.stop
        >
          <template #append-inner>
            <v-icon
                v-if="loadingAction !== 'rename'"
                icon="mdi-check"
                color="success"
                size="small"
                class="cursor-pointer"
                @click.stop="toggleEdit"
            />
          </template>
        </v-text-field>
      </div>

      <div class="d-flex flex-wrap justify-center gap-2 mb-2 w-100">
        <v-chip
            :color="medication.expired ? 'error' : 'success'"
            :variant="medication.expired ? 'flat' : 'tonal'"
            :size="$device.isMobile ? 'x-small' : 'small'"
            class="font-weight-medium"
        >
          <v-icon start icon="mdi-calendar-clock" size="x-small"/>
          {{ parseDate(medication.expiryDate) }}
        </v-chip>

        <v-chip
            v-if="boxCount > 0"
            color="primary"
            variant="tonal"
            :size="$device.isMobile ? 'x-small' : 'small'"
            class="font-weight-medium ml-2"
        >
          <v-icon start icon="mdi-package-variant" size="small"/>
          {{ boxCount }}
        </v-chip>
      </div>
    </div>

    <v-divider/>

    <div class="d-flex align-center justify-space-between px-2 py-2">
      <v-btn
          icon="mdi-minus"
          variant="tonal"
          color="primary"
          size="x-small"
          data-cy="decrement-button"
          :loading="loadingAction === 'decrement'"
          :disabled="medication.quantity <= 1 || loadingAction !== null"
          @click.stop="handleDecrement"
      />

      <div class="d-flex flex-column align-center mx-2">
          <div v-if="medication.details?.form"
               class="d-flex align-center text-caption text-medium-emphasis text-uppercase font-weight-bold"
               :style="{ fontSize: $device.isMobile ? '0.6rem !important' : '0.8rem !important' }">
            {{ getTranslatedForm(medication.details.form) }}
          </div>
          <div v-else
               class="d-flex align-center text-caption text-medium-emphasis text-uppercase font-weight-bold"
               :style="{ fontSize: $device.isMobile ? '0.6rem !important' : '0.8rem !important' }">
            {{ t('meds.quantity') }}
          </div>
        <span
            class="font-weight-bold primary--text line-height-1"
            :class="$device.isMobile ? 'text-subtitle-2' : 'text-subtitle-1'"
        >{{ medication.quantity }}</span>

      </div>

      <v-btn
          icon="mdi-plus"
          variant="flat"
          color="primary"
          data-cy="increment-button"
          size="x-small"
          :loading="loadingAction === 'increment'"
          :disabled="loadingAction !== null"
          @click.stop="handleIncrement"
      />
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type {Medication} from "~/types/medication"
import {parseDate} from "~/composables/parseDate"
import ValidationWithWarningDialog from "~/components/molecules/ValidationWithWarningDialog.vue"
import InfoDialog from "~/components/molecules/medications/InfoDialog.vue"
import {useI18n} from "vue-i18n"
import type {ToastType} from "~/composables/openToast";

const {$open, $device} = useNuxtApp()
const {t} = useI18n()

const {medication} = defineProps<{
  medication: Medication
}>()

const emit = defineEmits<{
  (e: 'increment-pills', medication: Medication, done: () => void): void
  (e: 'decrement-pills', medication: Medication, done: () => void): void
  (e: 'delete-pills', medication: Medication, done: () => void): void
  (e: 'update-medication-name', medication: Medication, newName: string, done: () => void): void
}>()

// UI state for loading and editing
const loadingAction = ref<'increment' | 'decrement' | 'delete' | 'rename' | null>(null)
const isEditing = ref(false)
const editedName = ref(medication.name)
const showFooterMobile = ref(false)

const handleCardClick = () => {
  if ($device.isMobile) {
    showFooterMobile.value = !showFooterMobile.value
  }
}

const handleNameClick = (e: Event) => {
  if ($device.isMobile && !showFooterMobile.value) return
  e.stopPropagation()
  startEdit()
}

const startEdit = () => {
  editedName.value = medication.name
  isEditing.value = true
}

const toggleEdit = () => {
  if (isEditing.value) {
    // Only emit if name actually changed and isn't empty
    if (editedName.value.trim() && editedName.value !== medication.name) {
      loadingAction.value = 'rename'
      emit('update-medication-name', medication, editedName.value.trim(), () => {
        loadingAction.value = null
        isEditing.value = false
      })
    } else {
      editedName.value = medication.name
      isEditing.value = false
    }
  }
}

const confirmDelete = async () => {
  const result = await $open<ToastType>(ValidationWithWarningDialog, {
    scrim: true,
    isPersistent: true,
    title: t('dialogDelete.title'),
    message: t('dialogDelete.message')
  })

  if (result === 'success') {
    loadingAction.value = 'delete'
    emit('delete-pills', medication, () => {
      loadingAction.value = null
    })
  }
}

const handleIncrement = () => {
  loadingAction.value = 'increment'
  emit('increment-pills', medication, () => {
    loadingAction.value = null
  })
}

const handleDecrement = () => {
  loadingAction.value = 'decrement'
  emit('decrement-pills', medication, () => {
    loadingAction.value = null
  })
}

const showMedicationDetails = async () => {
  await $open(InfoDialog, {
    scrim: true,
    isPersistent: false,
    data: medication
  })
}

const getTranslatedForm = (form: string) => {
  if (!form) return ''
  // Try to find translation for first word if full form not found (e.g. "Comprimé pelliculé" -> "Tablet")
  const key = form.toLowerCase().split(' ')[0]
  // Check if translation exists, otherwise return original
  return t(`forms.${key}`, form) !== `forms.${key}` ? t(`forms.${key}`) : form
}

const boxCount = computed(() => {
  if (!medication.details?.quantity) return 0
  return Math.ceil(medication.quantity / medication.details.quantity)
})
</script>

<style scoped>
.pill-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.pill-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.15) !important;
}

.expired-card {
  border: 1px solid rgb(var(--v-theme-error));
}

.pill-image-container {
  height: 64px;
  width: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.pill-icon svg) {
  width: 100% !important;
  height: 100% !important;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.name-display:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.name-display:hover .hover-opacity-1 {
  opacity: 1 !important;
}

.hover-opacity-1 {
  transition: opacity 0.2s ease;
}

.medication-name-input :deep(.v-field__input) {
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.line-height-1 {
  line-height: 1;
}

.z-index-1 {
  z-index: 1;
}

.pill-image-container.mobile-image {
  height: 48px;
  width: 48px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.2;
}

.opacity-100 {
  opacity: 1 !important;
}

.feature-card {
  background: var(--card-bg);
}

.lh-1 {
  line-height: 1;
}
</style>