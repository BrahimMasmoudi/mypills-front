<template>
  <v-sheet class="pa-4 h-100 overflow-hidden">
    <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary mb-2">{{ t('nav.prescriptions') }}</h1>
        <p class="text-body-1 text-medium-emphasis">{{ t('prescriptions.subtitle') }}</p>
      </div>
      <v-responsive :max-width="$device.isDesktop ? '300px' : '100%'" class="mt-4 mt-sm-0">
        <v-text-field v-model="searchQuery" :placeholder="t('prescriptions.search')" prepend-inner-icon="mdi-magnify"
                      variant="outlined" density="comfortable" rounded="pill" hide-details clearable color="primary"/>
      </v-responsive>
    </div>

    <v-row v-if="docStore.isLoading" justify="center" align="center" class="fill-height">
      <v-progress-circular indeterminate color="primary" size="64"/>
    </v-row>

    <v-sheet v-else-if="filteredDocuments.length === 0" height="80%"
             class="d-flex flex-column align-center justify-center">
      <v-icon :icon="searchQuery ? 'mdi-file-search-outline' : 'mdi-file-hidden'" size="80" color="grey-lighten-1"
              class="mb-4"/>
      <p class="text-h6 text-medium-emphasis">{{
          searchQuery ? t('prescriptions.noResults') : t('prescriptions.empty')
        }}</p>
    </v-sheet>

    <OrganismsPrescriptionsPrescriptionExpansionList
        v-else
        v-model:opened-panels="openedPanels"
        :visible-folders="visibleFolders"
        :get-docs="getDocsByFolder"
        :format-date="formatDate"
        @view="viewDocument"
        @renameFolder="handleRenameFolder"
        @deleteFolder="openDeleteFolderDialog"
        @renameDoc="handleRenameDoc"
        @deleteDoc="confirmDelete"
    />
  </v-sheet>
</template>

<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import {format} from 'date-fns'
import {fr, enUS} from 'date-fns/locale'
import {useDocumentsStore} from "~/store/documents";
import type {ToastType} from "~/composables/openToast";
import ValidationWithWarningDialog from "~/components/molecules/ValidationWithWarningDialog.vue";

const {t, locale} = useI18n()
const docStore = useDocumentsStore()
const {$open} = useNuxtApp()
const dateLocales: Record<string, any> = {fr, en: enUS}

const searchQuery = ref('')
const openedPanels = ref<string[]>([])

watch(searchQuery, (val) => {
  openedPanels.value = val ? [...visibleFolders.value] : []
})

const filteredDocuments = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return docStore.allDocuments.filter(d => d.name.toLowerCase().startsWith(q) || d.folderName.toLowerCase().startsWith(q))
})

const visibleFolders = computed(() => {
  const folders = new Set<string>()
  filteredDocuments.value.forEach(d => folders.add(d.folderName))
  return Array.from(folders).sort()
})

const getDocsByFolder = (folderName: string) => filteredDocuments.value.filter(d => d.folderName === folderName)

const formatDate = (timestamp: any) => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return format(date, 'dd MMM yyyy', {locale: dateLocales[locale.value] || enUS})
}

const viewDocument = (url: string) => window.open(url, '_blank')

const openDeleteFolderDialog = async (folder: string) => {
  const result = await $open<ToastType>(ValidationWithWarningDialog, {
    scrim: true, title: t('dialogDelete.title'), message: t('dialogDelete.message')
  })
  if (result === 'success') await docStore.deleteFolder(folder)
}

const confirmDelete = async (doc: any) => {
  const result = await $open<ToastType>(ValidationWithWarningDialog, {
    scrim: true, title: t('dialogDelete.title'), message: t('dialogDelete.message')
  })
  if (result === 'success') await docStore.deleteDocument(doc)
}

const handleRenameDoc = async (doc: any, newName: string, done: () => void) => {
  try {
    await docStore.renameDocument(doc, newName)
  } catch (e) {
    console.error(e)
  } finally {
    done()
  }
}

const handleRenameFolder = async (oldName: string, newName: string, done: () => void) => {
  try {
    await docStore.renameFolder(oldName, newName)
  } catch (e) {
    console.error(e)
  } finally {
    done()
  }
}
</script>