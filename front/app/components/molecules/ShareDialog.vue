<template>
  <!-- Desktop Layout -->
  <v-dialog
    v-if="$device.isDesktop"
    v-model="isActive"
    :width="550"
    content-class="elevation-0"
    @keydown.esc="handleClose"
  >
    <v-card class="rounded-xl pa-6" elevation="24">
      <div class="d-flex flex-column align-center text-center">
        <!-- Icon -->
        <v-avatar color="primary-lighten-5" size="80" class="mb-4">
          <v-icon icon="mdi-share-variant" color="primary" size="48" />
        </v-avatar>

        <!-- Title -->
        <v-card-title class="text-h5 font-weight-bold pt-0 pb-2">
          {{ t('shareDialog.title') }}
        </v-card-title>

        <!-- Description -->
        <v-card-text class="text-body-1 text-medium-emphasis py-2 px-6">
          {{ t('shareDialog.description') }}
        </v-card-text>

        <!-- Link Field with Loading State -->
        <v-card-text class="w-100 px-6 py-4">
          <v-text-field
            v-model="linkValue"
            readonly
            variant="outlined"
            :loading="loading"
            :disabled="loading"
            :placeholder="loading ? t('shareDialog.loading') : ''"
            density="comfortable"
            hide-details
          >
            <template #append-inner>
              <v-tooltip
                v-model="showCopiedTooltip" 
                :open-on-hover="false"
                :open-on-focus="false"
                location="top"
              >
                <template #activator="{props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-content-copy"
                    variant="text"
                    size="small"
                    :disabled="loading"
                    @click="copyLink"
                  />
                </template>
                <span>{{ t('shareDialog.copied') }}</span>
              </v-tooltip>
            </template>
          </v-text-field>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions class="w-100 justify-center pt-4 gap-4">
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            class="flex-grow-1 text-capitalize font-weight-bold"
            height="48"
            :disabled="loading"
            prepend-icon="mdi-share-variant"
            @click="handleShare"
          >
            {{ t('shareDialog.shareAction') }}
          </v-btn>

          <v-btn
            variant="outlined"
            size="large"
            color="grey-darken-1"
            class="flex-grow-1 text-capitalize font-weight-bold"
            height="48"
            @click="handleClose"
          >
            {{ t('shareDialog.close') }}
          </v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>

  <!-- Mobile Layout (Bottom Sheet Style) -->
  <v-dialog
    v-else
    v-model="isActive"
    color="transparent"
    width="100%"
    class="align-end ma-0"
    @keydown.esc="handleClose"
  >
    <v-card class="rounded-t-xl pa-5 pb-8" elevation="0">
      <div class="d-flex flex-column align-center text-center">
        <!-- Drag Handle Indicator -->
        <v-sheet
          color="grey-lighten-2"
          height="4"
          width="40"
          class="rounded-pill mb-6"
        />

        <v-avatar color="primary-lighten-5" size="72" class="mb-4">
          <v-icon icon="mdi-share-variant" color="primary" size="40" />
        </v-avatar>

        <h3 class="text-h6 font-weight-bold mb-2">
          {{ t('shareDialog.title') }}
        </h3>

        <p class="text-body-2 text-medium-emphasis px-4 mb-4">
          {{ t('shareDialog.description') }}
        </p>

        <!-- Link Field with Loading State -->
        <div class="w-100 px-2 mb-6">
          <v-text-field
            v-model="linkValue"
            readonly
            variant="outlined"
            :loading="loading"
            :disabled="loading"
            :placeholder="loading ? t('shareDialog.loading') : ''"
            density="comfortable"
            hide-details
          >
            <template #append-inner>
              <v-tooltip v-model="showCopiedTooltip" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-content-copy"
                    variant="text"
                    size="small"
                    :disabled="loading"
                    @click="copyLink"
                  />
                </template>
                <span>{{ t('shareDialog.copied') }}</span>
              </v-tooltip>
            </template>
          </v-text-field>
        </div>

        <div class="d-flex flex-column w-100 gap-3">
          <v-btn
            block
            color="primary"
            variant="flat"
            size="x-large"
            class="text-capitalize font-weight-bold rounded-lg"
            :disabled="loading"
            prepend-icon="mdi-share-variant"
            @click="handleShare"
          >
            {{ t('shareDialog.shareAction') }}
          </v-btn>

          <v-btn
            block
            variant="text"
            size="large"
            color="grey-darken-1"
            class="text-capitalize font-weight-bold mt-2"
            @click="handleClose"
          >
            {{ t('shareDialog.close') }}
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useDocumentsStore } from '~/store/documents'

const { t } = useI18n()
const { $device } = useNuxtApp()
const docStore = useDocumentsStore()

const { close, doc } = defineProps<{
  close: (result?: any) => void
  doc: any
}>()

const linkValue = ref('')
const loading = ref(true)
const isActive = ref(true)
const showCopiedTooltip = ref(false)

const handleClose = () => {
  isActive.value = false
  close()
}

const copyLink = async () => {
  if (loading.value) return
  try {
    await navigator.clipboard.writeText(linkValue.value)
    showCopiedTooltip.value = true
    setTimeout(() => {
      showCopiedTooltip.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}

const handleShare = async () => {
  if (loading.value) return
   try {
      await navigator.share({
        title: doc.name,
        text: t('shareDialog.emailBody', { docName: doc.name, link: linkValue.value }),
        url: linkValue.value
      })
    } catch (err) {
      // User cancelled or share failed
      console.error('Share failed:', err)
    }
}

// Fetch shareable link on mount
onMounted(async () => {
  try {
    const { url } = await docStore.getShareableLink(doc)
    linkValue.value = url
  } catch (error) {
    console.error('Error fetching shareable link:', error)
    linkValue.value = 'Error generating link'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}
.gap-3 {
  gap: 12px;
}
</style>
