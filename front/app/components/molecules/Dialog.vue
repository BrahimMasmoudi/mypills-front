<template>
  <v-dialog v-if="$device.isDesktop" v-model="isActive"
            :persistent="isPersistent"
            :scrim="scrim"
            @keydown.esc="cancelAndClose"
            width="600">
    <suspense>
      <v-card class="border" style="padding: 48px 72px 24px 72px !important;" variant="flat">

        <v-card-title class="d-flex justify-center pt-0 pl-0 title">
          {{ t('dialogCreate.title') }}
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <AtomsDialogInput label="Medication Name" v-model="medication.name" type="string"/>
              </v-col>

              <v-col cols="12">
                <AtomsDialogButton>
                  <template #default>
                      <span v-if="medication.expiryDate">
                          {{ formatDate(medication.expiryDate) }}
                      </span>
                    <span v-else>
                      {{ t('dialogCreate.choose-date-title') }}
                    </span>
                  </template>
                  <template #append>
                    <nuxt-icon class="small" filled name="calendar"/>
                  </template>
                  <template #menu>
                    <AtomsDialogMenu v-model="dateMenuIsOpen">
                      <template #menu-details>
                        <v-date-picker  :view-mode="viewMode"
                                          elevation="1"
                                          title=""
                                          :min="new Date()"
                                          @update:model-value="dateMenuIsOpen = false"
                                          :header="t('dialogCreate.choose-date-title')"
                                          color="primary"
                                          @update:year="updateYear"
                                          @update:view-mode="updateViewMode"
                                          @update:month="updateMonth"
                                        />
                      </template>
                    </AtomsDialogMenu>
                  </template>
                </AtomsDialogButton>
              </v-col>

              <v-col cols="12">
                <AtomsDialogInput label="Quantity" v-model="medication.quantity" type="number"/>
              </v-col>

              <v-col cols="12">
                <AtomsDialogButton >
                  <template #default>
                    <span v-if="medication.image">
                      <nuxt-icon filled class="selected-icon" :name="medication.image"/>
                    </span>
                    <span v-else>
                      Select Image
                    </span>
                  </template>
                  <template #append>
                    <nuxt-icon class="small" filled name="picto"/>
                  </template>
                  <template #menu>
                    <AtomsDialogMenu v-model="photoMenuIsOpen">
                      <template #menu-details>
                        <v-card class="bg-white" style="max-width: 300px;">
                          <v-container>
                            <v-row>
                              <v-col v-for="index in 14" :key="index" cols="3">
                                <nuxt-icon
                                    filled class="icon"
                                    :name="`pill-${index+1}`"
                                    @click="()=>setImage(`pill-${index+1}`)"/>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card>
                      </template>
                    </AtomsDialogMenu>
                  </template>
                </AtomsDialogButton>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-btn class="mx-auto mb-8"
                 height="45"
                 style="font-weight: 700;border-radius: 4px;border: 1px solid #DDD;background: #FFF;"
                 @click="cancelAndClose"
                 variant="outlined"
                 width="200">
         <span class="confirm text-primary">
             {{ t('cancel') }}
         </span>
          </v-btn>
          <v-btn class="mx-auto mb-8"
                 color="primary"
                 height="45"
                 style="font-weight: 700;"
                 :loading="loading"
                 variant="flat"
                 @click="onConfirmClick"
                 width="200">
         <span class="confirm">
             {{ t('confirm') }}
         </span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </suspense>
  </v-dialog>
  
  <v-dialog v-else v-model="isActive"
            :persistent="isPersistent"
            :scrim="scrim"
            @keydown.esc="cancelAndClose">
    <suspense>
      <v-card class="border pa-8" variant="flat">

        <v-card-title class="d-flex justify-center pt-0 pl-0 title-mobile">
          {{ t('dialogCreate.title') }}
        </v-card-title>
        <v-card-text class="px-0">
          <v-container>
            <v-row>
              <v-col cols="12">
                <AtomsDialogInput :label="t('dialogCreate.medicationLabel')" v-model="medication.name" type="string"/>
              </v-col>

              <v-col cols="12">
                <AtomsDialogButton>
                  <template #default>
                      <span v-if="medication.expiryDate">
                          {{ formatDate(medication.expiryDate) }}
                      </span>
                    <span v-else>
                      {{ t('dialogCreate.choose-date-title') }}
                    </span>
                  </template>
                  <template #append>
                    <nuxt-icon class="small" filled name="calendar"/>
                  </template>
                  <template #menu>
                    <AtomsDialogMenu v-model="dateMenuIsOpen">
                      <template #menu-details>
                  
                      <v-date-picker  :view-mode="viewMode"
                                      elevation="1"
                                      title=""
                                      :min="new Date()"
                                      @update:model-value="dateMenuIsOpen = false"
                                      :header="t('dialogCreate.choose-date-title')"
                                      color="primary"
                                      @update:year="updateYear"
                                      @update:view-mode="updateViewMode"
                                      @update:month="updateMonth"
                                        />
                      </template>
                    </AtomsDialogMenu>
                  </template>
                </AtomsDialogButton>
              </v-col>

              <v-col cols="12">
                <AtomsDialogInput :label="t('dialogCreate.quantity')" v-model="medication.quantity" type="number"/>
              </v-col>

              <v-col cols="12">
                <AtomsDialogButton>
                  <template #default>
                    <span v-if="medication.image">
                      <nuxt-icon filled class="selected-icon" :name="medication.image"/>
                    </span>
                    <span v-else>
                      Select Image
                    </span>
                  </template>
                  <template #append>
                    <nuxt-icon class="small" filled name="picto"/>
                  </template>
                  <template #menu>
                    <AtomsDialogMenu v-model="photoMenuIsOpen">
                      <template #menu-details>
                        <v-card class="bg-white">
                          <v-container>
                            <v-row>
                              <v-col v-for="index in 14" :key="index" cols="3">
                                <nuxt-icon
                                    filled class="icon-mobile"
                                    :name="`pill-${index+1}`"
                                    @click="()=>setImage(`pill-${index+1}`)"/>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card>
                      </template>
                    </AtomsDialogMenu>
                  </template>
                </AtomsDialogButton>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-btn class="mx-auto mb-4"
                 height="45"
                 style="font-weight: 700;border-radius: 4px;border: 1px solid #DDD;background: #FFF;"
                 @click="cancelAndClose"
                 variant="outlined"
                 width="120">
         <span class="confirm text-primary">
             {{ t('cancel') }}
         </span>
          </v-btn>
          <v-btn class="mx-auto mb-4"
                 color="primary"
                 height="45"
                 style="font-weight: 700;"
                 :loading="loading"
                 variant="flat"
                 @click="onConfirmClick"
                 width="120">
         <span class="confirm">
             {{ t('confirm') }}
         </span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </suspense>
  </v-dialog>
</template>
<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import type {Medication} from "~/types/medication";
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

const {t, locale} = useI18n()
const {$device} = useNuxtApp()

const locales: Record<string, any> = { en: enUS, fr: fr };


const isActive = ref(true)
const loading = ref(false)
const dateMenuIsOpen = ref(false)
const photoMenuIsOpen = ref(false)

const {close, createMedication,userUid, email} = defineProps<{
  close: (value : any) => void
  isPersistent: boolean
  scrim: boolean
  createMedication: (medication: Medication) => Promise<void>
  userUid : string
  email : string
}>()
const medication = ref<Medication>({
  expiryDate: new Date(),
  uid: userUid,
  expired: false,
  quantity: 1,
  name: 'médicament',
  bareCode: '',
  medicationId: crypto.randomUUID(),
  image: "pill-1",
  email
})

 const viewMode = ref<"month" | "months" | "year">('year')
  const selectedYear = ref()
  const selectedMonth = ref()

  const updateViewMode = (mode : 'year' | 'months') => {
    viewMode.value = mode === 'year' ? 'year' : 'months'
  }

  const updateYear = (year : number) => {
    selectedYear.value = year
  }

  const updateMonth = (month : number) => {
    selectedMonth.value = month
    dateMenuIsOpen.value = false
    medication.value.expiryDate = new Date(selectedYear.value, selectedMonth.value)
  }

  const formatDate = (date: Date | string) => {
  if (!date) return '';
  return format(new Date(date), 'MMMM yyyy', { locale: locales[locale.value] || enUS });
}


const onConfirmClick = async () => {
  medication.value.expiryDate = new Date(medication.value.expiryDate)
  try {
    loading.value = true
    medication.value.quantity = Number(medication.value.quantity)
    await createMedication(medication.value)
    loading.value = false
    close('success')
  } catch (e) {
    close('error')
  }
}

const setImage = (image: string) => {
  photoMenuIsOpen.value = false
  medication.value.image = image
}

const cancelAndClose = () => close({toastType: 'cancel'})
</script>
<style scoped>
div:deep(.v-field__input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.title {
  color: #000 !important;
  text-align: center !important;
  font-feature-settings: 'clig' off, 'liga' off !important;
  font-family: Roboto, sans-serif !important;
  font-size: 1.125rem !important;
  font-style: normal !important;
  font-weight: 700 !important;
  line-height: normal !important;
}

.title-mobile {
  color: #000 !important;
  text-align: center !important;
  font-feature-settings: 'clig' off, 'liga' off !important;
  font-family: Roboto, sans-serif !important;
  font-size: 1rem !important;
  font-style: normal !important;
  font-weight: 700 !important;
  line-height: normal !important;
}

.confirm {
  font-feature-settings: 'clig' off, 'liga' off !important;
  font-family: Roboto, sans-serif !important;
  font-size: 1rem !important;
  font-style: normal !important;
  font-weight: 700 !important;
  line-height: normal !important;
  letter-spacing: 0.27px !important;
}

div:deep(.v-card-item__append) {
  padding-left: 5px !important;
}

.v-textarea:deep(.v-field__input) {
  margin-top: 10px;
  margin-left: 10px;
  mask-image: none !important;
}

.v-btn {
  text-transform: unset !important;
}

div:deep(.v-field__clearable) {
  padding-top: 10px !important;
}

.confirm {
  font-feature-settings: 'clig' off, 'liga' off !important;
  font-family: Roboto, sans-serif !important;
  font-size: 1rem !important;
  font-style: normal !important;
  font-weight: 700 !important;
  line-height: normal !important;
  letter-spacing: 0.27px !important;
}

.icon {
  cursor: pointer;
}

.icon >>> svg {
  width: 48px !important;
  height: 48px !important;
}

.icon-mobile {
  cursor: pointer;
}

.icon-mobile >>> svg {
  width: 36px !important;
  height: 36px !important;
}

.selected-icon >>> svg {
  width: 36px !important;
  height: 36px !important;
}

</style>