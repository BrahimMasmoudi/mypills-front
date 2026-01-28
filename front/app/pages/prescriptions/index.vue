<template>
  <v-sheet class="pa-4 h-100 overflow-hidden">
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary mb-2">
          {{ t('nav.prescriptions') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis">
          {{ t('prescriptions.subtitle') }}
        </p>
      </div>

      <v-btn
          color="primary"
          prepend-icon="mdi-camera-plus"
          rounded="pill"
          elevation="2"
          @click="openScanDocumentDialog"
      >
        {{ t('actions.scanDocument') }}
      </v-btn>
    </div>

    <v-row v-if="docStore.isLoading" justify="center" align="center" class="fill-height">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-row>

    <v-sheet
        v-else-if="docStore.allDocuments.length === 0"
        height="80%"
        class="d-flex flex-column align-center justify-center"
    >
      <v-icon icon="mdi-file-hidden" size="80" color="grey-lighten-1" class="mb-4" />
      <p class="text-h6 text-medium-emphasis">{{ t('prescriptions.empty') }}</p>
    </v-sheet>

    <v-expansion-panels v-else variant="popout" class="mt-4" elevation="2">
      <v-expansion-panel
          v-for="folder in docStore.existingFolders"
          :key="folder"
          class="rounded-xl mb-4 "
      >
        <v-expansion-panel-title>
          <v-icon icon="mdi-folder-account" color="primary" class="mr-4" />
          <span class="text-h6 font-weight-bold">{{ folder }}</span>
          <v-spacer />
          <v-chip size="small" variant="tonal" color="primary" class="mr-2">
            {{ getDocsByFolder(folder).length }} {{ t('scanDocumentDialog.documents') }}
          </v-chip>
        </v-expansion-panel-title>

        <v-expansion-panel-text class="pt-4">
          <v-row>
            <v-col
                v-for="doc in getDocsByFolder(folder)"
                :key="doc.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
            >
              <v-card variant="outlined" class="rounded-lg hover-card" @click="viewDocument(doc.fileUrl)">
                <div class="d-flex align-center pa-3">
                  <v-avatar color="primary-lighten-5" rounded="lg" size="48" class="mr-3">
                    <v-icon icon="mdi-file-pdf-box" color="primary" size="32" />
                  </v-avatar>
                  <div class="overflow-hidden">
                    <div class="text-subtitle-1 font-weight-bold text-truncate">{{ doc.name }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatDate(doc.uploadedAt) }}
                    </div>
                  </div>
                </div>

                <v-divider />

                <v-card-actions class="justify-end px-2 py-1">
                  <v-btn icon="mdi-eye-outline" variant="text" color="primary" size="small" @click.stop="viewDocument(doc.fileUrl)" />
                  <v-btn icon="mdi-download" variant="text" color="grey-darken-1" size="small" :href="doc.fileUrl" target="_blank" />
                  <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click.stop="confirmDelete(doc)" />
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-sheet>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import {useDocumentsStore} from "~/store/documents";

const { t, locale } = useI18n()
const docStore = useDocumentsStore()
const { $device } = useNuxtApp()

const dateLocales: Record<string, any> = { fr, en: enUS }

// SEO
useSeoMeta({ title: () => t('nav.prescriptions', 'Prescriptions') })

// Helper to filter documents for the expansion panels
const getDocsByFolder = (folderName: string) => {
  return docStore.allDocuments.filter(d => d.folderName === folderName)
}

const formatDate = (timestamp: any) => {
  if (!timestamp) return ''
  // Firestore serverTimestamp needs toDate()
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return format(date, 'dd MMM yyyy', { locale: dateLocales[locale.value] || enUS })
}

// Actions
const viewDocument = (url: string) => {
  window.open(url, '_blank')
}

const openScanDocumentDialog = async () => {
  // Use the orchestration logic we built in the previous steps
  // (Assuming you have access to openScanDocumentDialog in this context)
}

const confirmDelete = async (doc: any) => {
  // Implementation of a delete confirmation dialog
  // await docStore.deleteDocument(doc)
}
</script>

<style scoped>
.hover-card {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.hover-card:hover {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgba(var(--v-theme-primary), 0.02);
  transform: translateY(-2px);
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>