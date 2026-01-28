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
    </div>

    <v-row v-if="docStore.isLoading" justify="center" align="center" class="fill-height">
      <v-progress-circular indeterminate color="primary" size="64"/>
    </v-row>

    <v-sheet
        v-else-if="docStore.allDocuments.length === 0"
        height="80%"
        class="d-flex flex-column align-center justify-center"
    >
      <v-icon icon="mdi-file-hidden" size="80" color="grey-lighten-1" class="mb-4"/>
      <p class="text-h6 text-medium-emphasis">{{ t('prescriptions.empty') }}</p>
    </v-sheet>

    <v-expansion-panels v-else class="mt-4" elevation="2">
      <v-expansion-panel
          v-for="folder in docStore.existingFolders"
          :key="folder"
          class="rounded-xl mb-4"
      >
        <v-expansion-panel-title>
          <v-icon icon="mdi-folder-account" color="primary" class="mr-4"/>

          <v-text-field
              v-if="editingFolders[folder] !== undefined"
              v-model="editingFolders[folder]"
              density="compact"
              variant="underlined"
              color="primary"
              hide-details
              class="max-width-200 font-weight-bold"
              @click.stop
              @keyup.enter="saveFolderRename(folder)"
              append-inner-icon="mdi-check"
              @click:append-inner="saveFolderRename(folder)"
          />
          <span v-else class="text-h6 font-weight-bold">{{ folder }}</span>

          <v-spacer/>

          <v-chip size="small" variant="tonal" color="primary" class="mr-2">
            {{ getDocsByFolder(folder).length }} {{ t('scanDocumentDialog.documents') }}
          </v-chip>

          <v-btn
              icon="mdi-pencil-outline"
              variant="text"
              color="primary"
              size="small"
              @click.stop="toggleFolderEdit(folder)"
          />
          <v-btn
              icon="mdi-delete-outline"
              variant="text"
              color="error"
              size="small"
              @click.stop="openDeleteFolderDialog(folder)"
          />
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
              <v-card variant="outlined" class="rounded-lg hover-card">
                <div class="d-flex flex-column pa-3">
                  <div class="d-flex align-center mb-2">
                    <v-avatar color="primary-lighten-5" rounded="lg" size="48" class="mr-3">
                      <v-icon icon="mdi-file-pdf-box" color="primary" size="32"/>
                    </v-avatar>

                    <div class="overflow-hidden flex-grow-1">
                      <v-text-field
                          v-if="editingDocs[doc.id] !== undefined"
                          v-model="editingDocs[doc.id]"
                          density="compact"
                          variant="underlined"
                          hide-details
                          class="text-subtitle-1 font-weight-bold"
                          @keyup.enter="saveDocRename(doc, folder)"
                          append-inner-icon="mdi-check"
                          @click:append-inner="saveDocRename(doc, folder)"
                      />
                      <div v-else class="text-subtitle-1 font-weight-bold text-truncate">{{ doc.name }}</div>

                      <div class="text-caption text-medium-emphasis">
                        {{ formatDate(doc.uploadedAt) }}
                      </div>
                    </div>
                  </div>
                </div>

                <v-divider/>

                <v-card-actions class="justify-end px-2 py-1">
                  <v-btn icon="mdi-eye-outline" variant="text" color="primary" size="small" @click="viewDocument(doc.fileUrl)"/>
                  <v-btn icon="mdi-pencil-outline" variant="text" color="grey-darken-1" size="small" @click="toggleDocEdit(doc)"/>
                  <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="confirmDelete(doc)"/>
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
import { useDocumentsStore } from "~/store/documents";
import type { ToastType } from "~/composables/openToast";
import ValidationWithWarningDialog from "~/components/molecules/ValidationWithWarningDialog.vue";

const { t, locale } = useI18n()
const docStore = useDocumentsStore()
const { $open } = useNuxtApp()

const dateLocales: Record<string, any> = { fr, en: enUS }

// UI State for Editing
const editingFolders = reactive<Record<string, string | undefined>>({})
const editingDocs = reactive<Record<string, string | undefined>>({})

const getDocsByFolder = (folderName: string) => {
  return docStore.allDocuments.filter(d => d.folderName === folderName)
}

const formatDate = (timestamp: any) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return format(date, 'dd MMM yyyy', { locale: dateLocales[locale.value] || enUS })
}

const viewDocument = (url: string) => {
  window.open(url, '_blank')
}

const toggleFolderEdit = (folder: string) => {
  if (editingFolders[folder] === undefined) {
    editingFolders[folder] = folder
  } else {
    editingFolders[folder] = undefined
  }
}

const saveFolderRename = async (oldName: string) => {
  const newName = editingFolders[oldName]
  if (newName && newName !== oldName) {
    await docStore.renameFolder(oldName, newName)
  }
  editingFolders[oldName] = undefined
}

/** * DOCUMENT EDITING LOGIC
 */
const toggleDocEdit = (doc: any) => {
  if (editingDocs[doc.id] === undefined) {
    editingDocs[doc.id] = doc.name
  } else {
    editingDocs[doc.id] = undefined
  }
}

const saveDocRename = async (doc: any, folder: string) => {
  const newName = editingDocs[doc.id]
  if (newName) {
    await docStore.renameDocument(doc, newName)
  }
  editingDocs[doc.id] = undefined
}

const openDeleteFolderDialog = async (folder: string) => {
  const result = await $open<ToastType>(ValidationWithWarningDialog, {
    scrim: true,
    isPersistent: true,
    title: t('dialogDelete.title'),
    message: t('dialogDelete.message')
  })
  if (result === 'success') {
    await docStore.deleteFolder(folder)
  }
}

const confirmDelete = async (doc: any) => {
  const result = await $open<ToastType>(ValidationWithWarningDialog, {
    scrim: true,
    isPersistent: true,
    title: t('dialogDelete.title'),
    message: t('dialogDelete.message')
  })
  if (result === 'success') {
    await docStore.deleteDocument(doc)
  }
}
</script>

<style scoped>
.hover-card {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}
.max-width-200 {
  max-width: 200px;
}
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>