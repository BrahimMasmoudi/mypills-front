<template>
  <v-card
      :color="isExpired ? '#FFF5F5' : 'surface'"
      :class="['pill-card', { 'expired-card': isExpired }]"
      elevation="2"
      rounded="lg"
      class="d-flex flex-column fill-height position-relative"
      @click="handleCardClick"
  >
    <!-- Delete Button (Top Right) -->
    <div class="position-absolute top-0 right-0 mr-2 ma-1 z-index-1">
      <v-btn
          icon="mdi-delete"
          variant="text"
          color="white"
          size="x-small"
          class="bg-red"
          density="comfortable"
          @click.stop="confirmDelete"
      />
    </div>

    <!-- Card Content -->
    <div
        class="d-flex flex-column align-center flex-grow-1 px-2"
        :class="$device.isMobile ? 'pt-4 pb-2' : 'pt-6 pb-2'"
    >
      <!-- Image -->
      <div
          class="pill-image-container mb-2"
          :class="$device.isMobile ? 'mobile-image' : ''"
      >
        <nuxt-icon filled :name="medication.image" class="pill-icon" />
      </div>

      <!-- Name (Editable) -->
      <div class="w-100 mb-1 position-relative d-flex justify-center">
        <div
            v-if="!isEditing"
            class="d-flex align-center justify-center cursor-pointer name-display py-1 px-2 rounded w-100"
            @click.stop="startEdit"
        >
          <span
              class="font-weight-bold text-center"
              :class="[
                  $device.isMobile ? 'text-body-2 text-wrap' : 'text-h6 text-truncate',
                  {'line-clamp-2': $device.isMobile}
              ]"
          >
            {{ medication.name }}
          </span>
          <v-icon
              v-if="!$device.isMobile"
              icon="mdi-pencil"
              size="14"
              class="ml-2 text-medium-emphasis opacity-0 hover-opacity-1 flex-shrink-0"
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
            @blur="toggleEdit"
            @keydown.enter="toggleEdit"
            @click.stop
        >
          <template #append-inner>
            <v-icon
                icon="mdi-check"
                color="success"
                size="small"
                class="cursor-pointer"
                @click.stop="toggleEdit"
            />
          </template>
        </v-text-field>
      </div>

      <!-- Expiry Date -->
      <v-chip
          :color="isExpired ? 'error' : 'success'"
          :variant="isExpired ? 'flat' : 'tonal'"
          size="x-small"
          class="mb-2 font-weight-medium"
      >
        <v-icon start icon="mdi-calendar-clock" size="x-small" />
        {{ parseDate(medication.expiryDate) }}
      </v-chip>
    </div>

    <v-divider v-if="shouldShowFooter" />

    <!-- Actions Footer -->
    <v-expand-transition>
      <div v-if="shouldShowFooter" class="d-flex align-center justify-space-between px-2 py-2">
        <v-btn
            icon="mdi-minus"
            variant="tonal"
            color="primary"
            size="x-small"
            :disabled="medication.quantity <= 1"
            @click.stop="decrementPills(medication)"
        />

        <div class="d-flex flex-column align-center mx-2">
          <span class="text-caption text-medium-emphasis text-uppercase font-weight-bold" style="font-size: 0.6rem !important;">{{ t('qty') }}</span>
          <span class="text-subtitle-2 font-weight-bold primary--text line-height-1">{{ medication.quantity }}</span>
        </div>

        <v-btn
            icon="mdi-plus"
            variant="flat"
            color="primary"
            size="x-small"
            @click.stop="incrementPills(medication)"
        />
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import type { Medication } from "~/types/medication";
import { parseDate } from "~/composables/parseDate";
import ValidationWithWarningDialog from "~/components/molecules/ValidationWithWarningDialog.vue";
import { useI18n } from "vue-i18n";

const { $open, $device } = useNuxtApp()
const { t } = useI18n()

const props = defineProps<{
  medication: Medication
  isExpired: boolean
  incrementPills: (medication: Medication) => Promise<void>
  decrementPills: (medication: Medication) => Promise<void>
  deletePills: (medication: Medication) => Promise<void>
  updateMedicationName: (medication: Medication, newName: string) => Promise<void>
}>()

const isEditing = ref(false)
const editedName = ref(props.medication.name)
const showFooterMobile = ref(false)

const shouldShowFooter = computed(() => {
  return $device.isDesktop || showFooterMobile.value
})

const handleCardClick = () => {
  if ($device.isMobile) {
    showFooterMobile.value = !showFooterMobile.value
  }
}

const startEdit = () => {
  editedName.value = props.medication.name
  isEditing.value = true
}

const toggleEdit = async () => {
  if (isEditing.value) {
    if (editedName.value.trim() && editedName.value !== props.medication.name) {
      await props.updateMedicationName(props.medication, editedName.value.trim())
    } else {
      editedName.value = props.medication.name
    }
    isEditing.value = false
  }
}

const confirmDelete = async () => {
  const toastType = await $open<ToastType>(ValidationWithWarningDialog, {
    scrim: true,
    isPersistent: true,
    title: t('dialogDelete.title'),
    message: t('dialogDelete.message')
  })

  if (toastType === 'success') {
    await props.deletePills(props.medication)
    openToast(toastType, t(`dialogDelete.${toastType}`))
  } else if (toastType === 'error') {
    openToast(toastType, t(`dialogDelete.${toastType}`))
  }
}
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
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
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
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.2;
}
</style>