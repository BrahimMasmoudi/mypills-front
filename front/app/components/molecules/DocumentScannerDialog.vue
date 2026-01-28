<template>
  <v-dialog
      v-if="$device.isDesktop"
      v-model="isActive"
      :persistent="isPersistent"
      :scrim="scrim"
      @keydown.esc="cancelAndClose"
      width="650"
      content-class="elevation-0"
  >
    <v-card class="rounded-xl pa-6" elevation="24">
      <div class="d-flex flex-column align-center text-center mb-6">
        <v-avatar color="primary-lighten-5" size="64">
          <v-icon icon="mdi-file-document-outline" color="primary" size="46"/>
        </v-avatar>
        <v-card-title class="text-h5 font-weight-bold pt-0 pb-1">
          {{ t('scanDocumentDialog.title') }}
        </v-card-title>
        <div class="text-body-2 text-medium-emphasis">
          {{ t('scanDocumentDialog.subtitle') }}
        </div>
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
            />

            <v-text-field
                v-model="scanData.name"
                :label="t('scanDocumentDialog.nameLabel')"
                variant="outlined"
                color="primary"
                hide-details="auto"
                rounded="lg"
                prepend-inner-icon="mdi-format-title"
                class="font-weight-medium elegant-input"
                :rules="[(v) => !!v || t('validation.required')]"
            >
              <template #append-inner>
                <v-tooltip location="top" text="Scan document">
                  <template v-slot:activator="{ props }">
                    <v-btn
                        v-bind="props"
                        icon="mdi-barcode-scan"
                        variant="tonal"
                        color="primary"
                        size="small"
                        class="ms-1"
                        @click="triggerCamera"
                    />
                  </template>
                </v-tooltip>

              </template>
            </v-text-field>

            <div v-if="pages.length > 0" class="mt-2">
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="text-subtitle-2 font-weight-bold text-primary">
                  <v-icon icon="mdi-layers-outline" size="18" class="mr-1"/>
                  {{ pages.length }} / 3 {{ t('scanDocumentDialog.pages') }}
                </div>
                <v-fade-transition>
                  <span v-if="pages.length >= 3" class="text-caption text-error font-weight-bold">
                    {{ t('scanDocumentDialog.limitReached') }}
                  </span>
                </v-fade-transition>
              </div>

              <v-row dense class="preview-grid overflow-y-auto">
                <v-col v-for="(page, i) in pages" :key="i" cols="4" sm="3">
                  <v-card class="rounded-lg border position-relative" elevation="2">
                    <v-img :src="page.previewUrl" aspect-ratio="3/4" cover class="bg-grey-lighten-3"/>
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
                      aspect-ratio="3/4"
                      variant="outlined"
                      color="primary"
                      class="d-flex flex-column align-center justify-center border-dashed rounded-lg h-100"
                      min-height="120"
                      @click="triggerCamera"
                  >
                    <v-icon icon="mdi-plus" size="24"/>
                    <span class="text-caption font-weight-bold">{{ t('scanDocumentDialog.add') }}</span>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class=" justify-center pt-8 gap-3 px-0">
        <v-btn variant="outlined"
               class="text-capitalize font-weight-bold"
               size="large" color="grey-darken-1" @click="cancelAndClose">
          {{ t('cancel') }}
        </v-btn>
        <v-btn
            color="primary"
            class="text-capitalize font-weight-bold"
            variant="flat"
            size="large"
            :loading="isUploading"
            :disabled="pages.length === 0 || !isValid"
            @click="onConfirmClick"
        >
          {{ t('confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
      v-else
      v-model="isActive"
      :persistent="isPersistent"
      :scrim="scrim"
      color="transparent"
      width="100%"
      class="align-end ma-0"
  >
    <v-card class="rounded-t-xl pa-5 pb-8" elevation="0">
      <v-sheet color="grey-lighten-2" height="4" width="40" class="rounded-pill mx-auto mb-6"/>
      <div class="text-center mb-6">
        <h3 class="text-h6 font-weight-bold">{{ t('scanDocumentDialog.title') }}</h3>
      </div>
      <v-form ref="form" v-model="isValid">
        <div class="d-flex flex-column gap-4 mb-6">
          <v-combobox v-model="scanData.folder" :items="existingFolders" :label="t('scanDocumentDialog.folderLabel')"
                      variant="outlined" rounded="lg" hide-details="auto"/>
          <v-text-field v-model="scanData.name" :label="t('scanDocumentDialog.nameLabel')" variant="outlined"
                        rounded="lg" hide-details="auto"/>

          <div v-if="pages.length > 0" class="mt-2">
            <div class="text-caption font-weight-bold mb-2" :class="pages.length >= 3 ? 'text-error' : 'text-grey'">
              {{ pages.length }} / 3 {{ t('scanDocumentDialog.pages') }}
            </div>
            <v-row dense>
              <v-col v-for="(page, i) in pages" :key="i" cols="4">
                <v-card class="rounded-lg border position-relative">
                  <v-img :src="page.previewUrl" aspect-ratio="3/4" cover/>
                  <v-btn icon="mdi-close" size="x-small" color="error" variant="flat"
                         class="position-absolute top-0 right-0 ma-1" @click="removePage(i)"/>
                </v-card>
              </v-col>
              <v-col v-if="pages.length < 3" cols="4">
                <v-card aspect-ratio="3/4" variant="outlined" color="primary"
                        class="d-flex align-center justify-center border-dashed rounded-lg h-100"
                        @click="triggerCamera">
                  <v-icon icon="mdi-camera-plus"/>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <v-btn v-else block color="primary" variant="tonal" class="border-dashed py-3" prepend-icon="mdi-camera"
                 @click="triggerCamera" :loading="isCompressing">
            {{ t('scanDocumentDialog.startScanning') }}
          </v-btn>
        </div>
      </v-form>
      <v-act class="d-flex flex-column gap-3">
        <v-btn block color="primary" variant="flat" size="x-large" :loading="isUploading"
               :disabled="pages.length === 0 || !isValid" @click="onConfirmClick">
          {{ t('confirm') }}
        </v-btn>
        <v-btn block variant="text" color="grey" @click="cancelAndClose">
          {{ t('cancel') }}
        </v-btn>
      </v-act>
    </v-card>
  </v-dialog>

  <input ref="fileInput" type="file" accept="image/*" capture="environment" class="d-none" @change="onFileSelected"/>
</template>

<script setup lang="ts">
import {ref, reactive, computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {useImageCompressor} from '~/composables/useImageCompressor'

const props = defineProps<{
  isPersistent?: boolean
  scrim?: boolean
  userFolders: string[]
  uploadAction: (data: { folder: string; name: string; files: File[] }) => Promise<void>
  close: (status: 'success' | 'canceled' | 'error') => void
}>()

const {t} = useI18n()
const {compressImage} = useImageCompressor()

const isActive = ref(true)
const isValid = ref(false)
const isUploading = ref(false)
const isCompressing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const scanData = reactive({folder: '', name: ''})
const pages = ref<{ file: File; previewUrl: string }[]>([])

const existingFolders = computed(() => Array.from(new Set([...props.userFolders])))

const triggerCamera = () => {
  if (pages.value.length < 3) fileInput.value?.click()
}

const onFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length || pages.value.length >= 3) return

  isCompressing.value = true
  try {
    const compressed = await compressImage(input.files[0], 0.7, 1200)
    pages.value.push({file: compressed, previewUrl: URL.createObjectURL(compressed)})
  } finally {
    isCompressing.value = false
    input.value = ''
  }
}

const removePage = (index: number) => {
  URL.revokeObjectURL(pages.value[index].previewUrl)
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
  pages.value.forEach(p => URL.revokeObjectURL(p.previewUrl))
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

.elegant-input :deep(.v-field__input) {
  padding-top: 10px;
  padding-bottom: 10px;
  min-height: 56px;
}
</style>