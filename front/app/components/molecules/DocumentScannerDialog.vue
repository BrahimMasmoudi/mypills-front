<template>
  <v-dialog
    v-if="$device.isDesktop"
    v-model="isActive"
    :persistent="isPersistent"
    :scrim="scrim"
    width="650"
    content-class="elevation-0"
    @keydown.esc="cancelAndClose"
  >
    <v-card class="rounded-xl pa-6" elevation="24" data-cy="document-scanner-dialog">
      <div class="d-flex flex-column align-center text-center mb-6">
        <v-avatar color="primary-lighten-5" size="64" class="mb-2">
          <v-icon :icon="isPdfMode ? 'mdi-file-pdf-box' : 'mdi-camera-outline'" color="primary" size="36"/>
        </v-avatar>
        <v-card-title class="text-h5 font-weight-bold pt-0 pb-1">
          {{ t('scanDocumentDialog.title') }}
        </v-card-title>
        <div class="text-body-2 text-medium-emphasis">
          {{ t('scanDocumentDialog.subtitle') }}
        </div>
      </div>

      <div class="d-flex justify-center mb-6">
        <v-btn-toggle
          v-model="uploadMode"
          mandatory
          color="primary"
          variant="outlined"
          rounded="pill"
          class="mode-toggle"
          data-cy="mode-toggle"
          @update:model-value="handleModeChange"
        >
          <v-btn value="images" class="px-8 text-capitalize font-weight-bold" data-cy="mode-images-btn">
            <v-icon start icon="mdi-camera"/>
            {{ t('scanDocumentDialog.modeImages') }}
          </v-btn>
          <v-btn value="pdf" class="px-8 text-capitalize font-weight-bold" data-cy="mode-pdf-btn">
            <v-icon start icon="mdi-file-pdf-box"/>
            {{ t('scanDocumentDialog.modePdf') }}
          </v-btn>
        </v-btn-toggle>
      </div>

      <v-card-text class="pa-0">
        <v-form ref="form" v-model="isValid">
          <div class="d-flex flex-column gap-4">
            <v-combobox
              v-model="scanData.folder"
              :items="existingFolders"
              :label="t('scanDocumentDialog.folderLabel')"
              variant="outlined"
              color="primary"
              hide-details="auto"
              rounded="lg"
              prepend-inner-icon="mdi-folder-open"
              class="font-weight-medium elegant-input"
              :rules="[(v) => !!v || t('validation.required')]"
              data-cy="folder-input"
            />

            <v-text-field
              v-model="scanData.name"
              :label="isPdfMode && pages.length > 1 ? t('scanDocumentDialog.prefixLabel') : t('scanDocumentDialog.nameLabel')"
              :hint="isPdfMode && pages.length > 1 ? t('scanDocumentDialog.multipleHint') : ''"
              persistent-hint
              variant="outlined"
              color="primary"
              hide-details="auto"
              rounded="lg"
              prepend-inner-icon="mdi-format-title"
              class="font-weight-medium elegant-input"
              :rules="!isPdfMode ? [(v) => !!v || t('validation.required')] : []"
              data-cy="document-name-input"
            />

            <div v-if="pages.length > 0" class="mt-2">
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="text-subtitle-2 font-weight-bold text-primary d-flex align-center">
                  <v-icon :icon="isPdfMode ? 'mdi-file-pdf-box' : 'mdi-layers-outline'" size="18" class="mr-1"/>
                  <span>{{ pages.length }} / 3 {{ isPdfMode ? 'PDFs' : t('scanDocumentDialog.pages') }}</span>
                </div>
                <v-fade-transition>
                  <span v-if="pages.length >= 3" class="text-caption text-error font-weight-bold">
                    {{ t('scanDocumentDialog.limitReached') }}
                  </span>
                </v-fade-transition>
              </div>

              <v-row dense class="preview-grid overflow-y-auto">
                <v-col
                  v-for="(page, i) in pages"
                  :key="i"
                  cols="4"
                  sm="3"
                >
                  <v-card class="rounded-lg border position-relative" height="120" elevation="2">
                    <v-img
                      v-if="!isPdfMode"
                      :src="page.previewUrl"
                      aspect-ratio="3/4"
                      cover
                      class="bg-grey-lighten-3"
                    />
                    <v-sheet
                      v-else
                      height="100%"
                      class="d-flex flex-column align-center justify-center bg-grey-lighten-4 pa-2"
                    >
                      <v-icon icon="mdi-file-pdf-box" color="error" size="40"/>
                      <span class="text-caption text-truncate w-100 text-center">{{ page.file.name }}</span>
                    </v-sheet>
                    <v-btn
                      icon="mdi-close-circle"
                      color="error"
                      size="x-small"
                      variant="flat"
                      class="position-absolute top-0 right-0 ma-1 shadow-sm"
                      @click="removePage(i)"
                    />
                  </v-card>
                </v-col>

                <v-col v-if="pages.length < 3" cols="4" sm="3">
                  <v-card
                    variant="outlined"
                    color="primary"
                    class="d-flex flex-column align-center justify-center border-dashed rounded-lg h-100"
                    min-height="120"
                    @click="triggerCamera"
                  >
                    <v-icon :icon="isPdfMode ? 'mdi-file-plus' : 'mdi-camera-plus'" size="24"/>
                    <span class="text-caption font-weight-bold">{{ t('scanDocumentDialog.add') }}</span>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <v-card
              v-else
              variant="outlined"
              class="border-dashed rounded-xl py-10 d-flex flex-column align-center justify-center cursor-pointer"
              color="primary"
              @click="triggerCamera"
            >
              <v-icon :icon="isPdfMode ? 'mdi-file-upload-outline' : 'mdi-camera-iris'" size="48" class="mb-2"/>
              <span class="text-subtitle-1 font-weight-bold">
                {{ isPdfMode ? t('scanDocumentDialog.uploadPdf') : t('scanDocumentDialog.startScanning') }}
              </span>
              <span class="text-caption text-medium-emphasis">{{ t('scanDocumentDialog.maxThreeFiles') }}</span>
            </v-card>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center pt-8 gap-3 px-0">
        <v-btn
          variant="outlined"
          class="text-capitalize font-weight-bold"
          size="large"
          data-cy="cancel-btn"
          @click="cancelAndClose"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          :loading="isUploading"
          :disabled="pages.length === 0 || !isValid"
          data-cy="confirm-upload-btn"
          @click="onConfirmClick"
        >
          {{ t('confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-else-if="$device.isMobile"
    v-model="isActive"
    transition="dialog-bottom-transition"
    scrollable
  >
    <v-card class="bg-surface d-flex flex-column rounded-xl">
      <v-toolbar
        color="surface"
        density="compact"
        class="border-b pl-2 pr-2"
        flat
      >
        <v-toolbar-title class="text-subtitle-1 font-weight-bold text-center">
          {{ t('scanDocumentDialog.title') }}
        </v-toolbar-title>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="medium-emphasis"
          @click="cancelAndClose"
        />
      </v-toolbar>

      <v-card-text class="pa-4 flex-grow-1 overflow-y-auto">
        <v-form ref="form" v-model="isValid">
          <div class="d-flex flex-column gap-4">

            <v-btn-toggle
              v-model="uploadMode"
              mandatory
              color="primary"
              variant="outlined"
              rounded="lg"
              class="d-flex w-100 mb-2"
              @update:model-value="handleModeChange"
            >
              <v-btn value="images" class="flex-grow-1 text-capitalize font-weight-bold" size="small">
                <v-icon start icon="mdi-camera" size="18"/>
                {{ t('scanDocumentDialog.modeImages') }}
              </v-btn>
              <v-btn value="pdf" class="flex-grow-1 text-capitalize font-weight-bold" size="small">
                <v-icon start icon="mdi-file-pdf-box" size="18"/>
                PDF
              </v-btn>
            </v-btn-toggle>

            <v-combobox
              v-model="scanData.folder"
              :items="existingFolders"
              :label="t('scanDocumentDialog.folderLabel')"
              variant="outlined"
              color="primary"
              hide-details="auto"
              rounded="lg"
              prepend-inner-icon="mdi-folder-open"
              class="font-weight-medium elegant-input"
              :rules="[(v) => !!v || t('validation.required')]"
            />

            <v-text-field
              v-model="scanData.name"
              :label="isPdfMode && pages.length > 1 ? t('scanDocumentDialog.prefixLabel') : t('scanDocumentDialog.nameLabel')"
              :hint="isPdfMode && pages.length > 1 ? t('scanDocumentDialog.multipleHint') : ''"
              persistent-hint
              variant="outlined"
              color="primary"
              hide-details="auto"
              rounded="lg"
              prepend-inner-icon="mdi-format-title"
              class="font-weight-medium elegant-input"
              :rules="!isPdfMode ? [(v) => !!v || t('validation.required')] : []"
            />

            <v-divider class="my-2"/>

            <div v-if="pages.length > 0">
              <div class="d-flex justify-space-between align-center mb-3">
                <div class="text-subtitle-2 font-weight-bold text-medium-emphasis">
                  {{ pages.length }} / 3 {{ isPdfMode ? 'PDFs' : t('scanDocumentDialog.pages') }}
                </div>
                <v-btn
                  v-if="pages.length < 3"
                  size="small"
                  variant="tonal"
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="triggerCamera"
                >
                  {{ t('add') }}
                </v-btn>
              </div>

              <v-row dense>
                <v-col v-for="(page, i) in pages" :key="i" cols="6">
                  <v-card
                    class="rounded-lg border position-relative"
                    height="160"
                    elevation="0"
                    color="grey-lighten-5"
                  >
                    <v-img
                      v-if="!isPdfMode"
                      :src="page.previewUrl"
                      aspect-ratio="3/4"
                      cover
                      class="h-100 rounded-lg"
                    />
                    <v-sheet v-else height="100%" class="d-flex flex-column align-center justify-center bg-transparent pa-2">
                      <v-icon icon="mdi-file-pdf-box" color="error" size="48"/>
                      <span class="text-caption text-truncate w-100 text-center mt-2 font-weight-medium">{{ page.file.name }}</span>
                    </v-sheet>
                    <v-btn
                      icon="mdi-close"
                      color="error"
                      size="x-small"
                      variant="flat"
                      class="position-absolute top-0 right-0 ma-2 shadow-sm"
                      @click="removePage(i)"
                    />
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <v-card
              v-else
              variant="tonal"
              class="border-dashed rounded-xl py-12 d-flex flex-column align-center justify-center cursor-pointer mt-2 bg-primary-lighten-5"
              color="primary"
              elevation="0"
              @click="triggerCamera"
            >
              <v-avatar color="white" size="64" class="mb-3 elevation-1">
                <v-icon :icon="isPdfMode ? 'mdi-file-upload-outline' : 'mdi-camera-iris'" size="32" color="primary"/>
              </v-avatar>
              <span class="text-subtitle-1 font-weight-bold text-primary">
                {{ isPdfMode ? t('scanDocumentDialog.uploadPdf') : t('scanDocumentDialog.startScanning') }}
              </span>
            </v-card>

          </div>
        </v-form>
      </v-card-text>

      <div class="pa-4 bg-surface border-t">
        <v-btn
          block
          color="primary"
          size="x-large"
          rounded="xl"
          class="font-weight-bold shadow-lg"
          :loading="isUploading"
          :disabled="pages.length === 0 || !isValid"
          @click="onConfirmClick"
        >
          {{ t('confirm') }} ({{ pages.length }})
        </v-btn>
      </div>
    </v-card>
  </v-dialog>


  <input
    ref="fileInput"
    type="file"
    :accept="isPdfMode ? 'application/pdf' : 'image/*'"
    class="d-none"
    :multiple="isPdfMode"
    @change="onFileSelected"
  >
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useImageCompressor } from '~/composables/useImageCompressor'

export type UploadDocumentsData = { folder: string; name: string; files: File[] }
const props = defineProps<{
  isPersistent?: boolean
  scrim?: boolean
  userFolders: string[]
  uploadAction: (data: UploadDocumentsData) => Promise<void>
  close: (status: 'success' | 'canceled' | 'error') => void
}>()

const { t } = useI18n()
const { compressImage } = useImageCompressor()

// Mode Toggle State
const uploadMode = ref<'images' | 'pdf'>('images')
const isPdfMode = computed(() => uploadMode.value === 'pdf')

const isActive = ref(true)
const isValid = ref(false)
const isUploading = ref(false)
const isCompressing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const scanData = reactive({ folder: '', name: '' })
const pages = ref<{ file: File; previewUrl: string }[]>([])

const existingFolders = computed(() => Array.from(new Set([...props.userFolders])))

const handleModeChange = () => {
  // Logic: When switching modes, clear the selection to prevent mixing
  pages.value.forEach(p => p.previewUrl && URL.revokeObjectURL(p.previewUrl))
  pages.value = []
  scanData.name = ''
}

const triggerCamera = () => {
  if (pages.value.length < 3) fileInput.value?.click()
}

const onFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const selectedFiles = Array.from(input.files || [])
  if (selectedFiles.length === 0) return

  for (const file of selectedFiles) {
    if (pages.value.length >= 3) break

    if (isPdfMode.value) {
      // PDF Mode: No compression
      pages.value.push({ file, previewUrl: '' })
    } else {
      // Image Mode: Compression
      isCompressing.value = true
      try {
        const compressed = await compressImage(file, 0.7, 1200)
        pages.value.push({
          file: compressed,
          previewUrl: URL.createObjectURL(compressed)
        })
      } finally {
        isCompressing.value = false
      }
    }
  }

  // Auto-fill name if first file
  if (pages.value.length > 0 && !scanData.name && !isPdfMode.value) {
    scanData.name = pages.value[0].file.name.split('.')[0]
  }
  input.value = ''
}

const removePage = (index: number) => {
  if (pages.value[index].previewUrl) URL.revokeObjectURL(pages.value[index].previewUrl)
  pages.value.splice(index, 1)
}

const onConfirmClick = async () => {
  isUploading.value = true
  try {
    await props.uploadAction({
      folder: scanData.folder,
      name: scanData.name,
      files: pages.value.map(p => p.file)
    })
    props.close('success')
  } catch (e) {
    props.close('error')
  } finally {
    isUploading.value = false
  }
}

const cancelAndClose = () => {
  pages.value.forEach(p => p.previewUrl && URL.revokeObjectURL(p.previewUrl))
  props.close('canceled')
}
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}

.gap-3 {
  gap: 12px;
}

.border-dashed {
  border-style: dashed !important;
  border-width: 2px !important;
}

.mode-toggle {
  background-color: rgb(var(--v-theme-grey-lighten-4));
  padding: 4px;
}

.mode-toggle :deep(.v-btn--active) {
  background-color: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.elegant-input :deep(.v-field__input) {
  padding-top: 10px;
  padding-bottom: 10px;
  min-height: 56px;
}

.preview-grid {
  max-height: 250px;
}
</style>