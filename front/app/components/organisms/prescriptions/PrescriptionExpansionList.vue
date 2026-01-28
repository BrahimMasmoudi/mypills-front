<template>
  <v-expansion-panels v-model="internalPanels" multiple class="mt-4" elevation="2">
    <v-expansion-panel
        v-for="folder in visibleFolders"
        :key="folder"
        :value="folder"
        class="rounded-xl mb-4"
    >
      <v-expansion-panel-title>
        <MoleculesPrescriptionsFolderHeader
            :folder-name="folder"
            :doc-count-label="t('scanDocumentDialog.documents', getDocs(folder).length)"
            @rename="(oldN, newN) => $emit('renameFolder', oldN, newN)"
            @delete="(name) => $emit('deleteFolder', name)"
        />
      </v-expansion-panel-title>

      <v-expansion-panel-text class="pt-4">
        <v-row>
          <v-col v-for="doc in getDocs(folder)" :key="doc.id" cols="12" sm="6" md="4" lg="3">
            <MoleculesPrescriptionsDocumentCard
                :doc="doc"
                :formatted-date="formatDate(doc.uploadedAt)"
                @view="(url) => $emit('view', url)"
                @delete="(d) => $emit('deleteDoc', d)"
                @rename="(d, newN) => $emit('renameDoc', d, newN)"
            />
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";

defineProps<{
  visibleFolders: string[];
  getDocs: (f: string) => any[];
  formatDate: (t: any) => string;
  openedPanels: string[]
}>()
const emit = defineEmits(['renameFolder', 'deleteFolder', 'renameDoc', 'deleteDoc', 'view', 'update:openedPanels'])
const {t} = useI18n()

const internalPanels = defineModel('openedPanels')
</script>