<template>
  <v-dialog v-model="isActive" width="550" :persistent="isPersistent" :scrim="scrim">
    <v-card class="rounded-xl overflow-hidden border-0" elevation="24">
      <v-sheet color="primary" class="pa-6 text-white position-relative overflow-hidden">
        <div class="d-flex justify-space-between align-start z-index-2 position-relative">
          <div>
            <div class="text-overline opacity-80 mb-1">{{ data.titulaire }}</div>
            <h2 class="text-h5 font-weight-black leading-tight">
              {{ data.elementPharmaceutique }}
            </h2>
            <v-chip size="small" color="white" variant="flat" class="mt-3 text-primary font-weight-bold">
              <v-icon start icon="mdi-check-decagram"/>
              {{ data.statusAutorisation }}
            </v-chip>
          </div>
          <v-btn icon="mdi-close" variant="text" color="white" @click="handleClose"/>
        </div>
        <v-icon icon="mdi-pill" class="position-absolute"
                style="right: -20px; bottom: -20px; font-size: 160px; opacity: 0.1; transform: rotate(-20deg);"/>
      </v-sheet>

      <v-card-text class="pa-6 bg-grey-lighten-5">
        <v-card variant="flat" class="rounded-lg border mb-6 pa-4 bg-white">
          <div class="text-subtitle-2 font-weight-bold text-primary mb-3 d-flex align-center">
            <v-icon icon="mdi-molecule" class="mr-2" size="20"/>
            {{ t('detailsDialog.substances') }}
          </div>
          <div v-for="comp in data.composition" :key="comp.codeSubstance"
               class="d-flex justify-space-between align-center">
            <div>
              <div class="text-body-1 font-weight-bold">{{ comp.denominationSubstance }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('detailsDialog.activeComponent') }}</div>
            </div>
            <div class="text-h6 font-weight-black text-primary">{{ comp.dosage }}</div>
          </div>
        </v-card>

        <v-row dense class="mb-4">
          <v-col cols="6">
            <v-card variant="outlined" class="pa-3 rounded-lg bg-white border-light">
              <suspense>
                <nuxt-icon name="mouth" size="20" class="text-grey-darken-1"/>
              </suspense>
              <div class="text-caption text-medium-emphasis">{{ t('detailsDialog.method') }}</div>
              <div class="text-body-2 font-weight-bold capitalize">{{ data.voiesAdministration[0] }}</div>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card variant="outlined" class="pa-3 rounded-lg bg-white border-light">
              <v-icon icon="mdi-form-select" color="grey-darken-1" size="20" class="mb-2"/>
              <div class="text-caption text-medium-emphasis">{{ t('detailsDialog.form') }}</div>
              <div class="text-body-2 font-weight-bold capitalize">{{ data.formePharmaceutique }}</div>
            </v-card>
          </v-col>
        </v-row>

        <div class="bg-blue-lighten-5 rounded-lg pa-4 d-flex align-center justify-space-between mb-6"
             v-if="mainPresentation">
          <div class="d-flex align-center">
            <v-icon icon="mdi-cash-check" color="blue-darken-2" class="mr-3"/>
            <div>
              <div class="text-caption text-blue-darken-2 font-weight-bold uppercase">{{
                  t('detailsDialog.refund')
                }}
              </div>
              <div class="text-body-2 font-weight-bold">{{
                  mainPresentation.tauxRemboursement || 'Non remboursé'
                }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-h5 font-weight-black text-blue-darken-3">{{ mainPresentation.prix }} €</div>
          </div>
        </div>

        <v-expansion-panels variant="accordion" class="admin-details">
          <v-expansion-panel elevation="0" class="bg-transparent border-t">
            <v-expansion-panel-title class="px-0 text-caption text-medium-emphasis">
              {{ t('detailsDialog.technicalDetails') }}
            </v-expansion-panel-title>
            <v-expansion-panel-text class="px-0">
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Code CIS</span><span class="font-weight-bold">{{ data.cis }}</span>
              </div>
              <div class="d-flex justify-space-between text-caption mb-1">
                <span>Code CIP13</span><span class="font-weight-bold">{{ mainPresentation?.cip13 }}</span>
              </div>
              <div class="d-flex justify-space-between text-caption">
                <span>{{ t('detailsDialog.ammDate') }}</span><span class="font-weight-bold">{{ data.dateAMM }}</span>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions class="pa-6 bg-white border-t">
        <v-btn block color="primary" variant="flat" height="48" rounded="lg" @click="handleClose">
          {{ t('close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";

const props = defineProps<{
  close: (value?: any) => void
  isPersistent: boolean
  scrim: boolean
  data: any
}>()

const {t} = useI18n()
const isActive = ref(true)
const mainPresentation = computed(() => props.data.presentation?.[0])

const handleClose = () => {
  isActive.value = false
  props.close()
}
</script>

<style scoped>
.capitalize {
  text-transform: capitalize;
}

.z-index-2 {
  z-index: 2;
}

.admin-details :deep(.v-expansion-panel-text__wrapper) {
  padding: 8px 0;
}

.border-light {
  border-color: rgba(var(--v-border-color), 0.08) !important;
}

.v-btn {
  font-feature-settings: 'clig' off, 'liga' off;
  font-family: Roboto, sans-serif;
  font-size: 1rem;
  font-style: normal;
  line-height: normal;
  letter-spacing: 0.27px;
}
</style>