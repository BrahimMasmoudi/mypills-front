<template>
  <v-app>
    <v-app-bar elevation="0" border="b">
      <div class="d-flex align-center w-100 px-4">
        <v-btn
            v-if="$device.isDesktop"
            icon
            variant="text"
            class="mr-2"
            @click.stop="drawer = !drawer"
        >
          <v-icon :icon="drawer ? 'mdi-close' : 'mdi-menu'"/>
        </v-btn>

        <div class="d-flex align-center cursor-pointer">
          <nuxt-icon name="application-icon" filled class="app-title-icon mr-2"/>
          <span class="app-title-text text-primary">{{ t('title') }}</span>
        </div>

        <v-spacer/>

        <div v-if="userStore.user" class="d-flex align-center">
          <MoleculesUserMenu/>
        </div>
      </div>
    </v-app-bar>

    <LayoutNavigationDrawer v-if="$device.isDesktop" v-model="drawer"/>

    <LayoutBottomDrawer v-if="$device.isMobile"/>

    <v-speed-dial
        v-model="isDialOpen"
        location="bottom end"
        transition="slide-y-reverse-transition"
    >
      <template v-slot:activator="{ props: activatorProps }">
        <v-fab
            v-bind="activatorProps"
            color="primary"
            size="x-large"
            app
            data-cy="fab-button"
            :icon="isDialOpen ? 'mdi-close' : 'mdi-plus'"
            location="bottom end"
            :extended="!$device.isMobile"
            :text="!$device.isMobile ? t('add-pill') : ''"
            class="mr-4 mb-4"
        />
      </template>

      <v-btn data-cy="add-medication-button" key="1" color="secondary" prepend-icon="mdi-pill"
             class="text-capitalize font-weight-bold" rounded="lg" size="large"
             @click="openAddMedicationDialog">
        {{ t('actions.addMedication') }}
      </v-btn>
      <v-btn data-cy="create-reminder-button" key="2" color="primary" prepend-icon="mdi-alarm-plus"
             class="text-capitalize font-weight-bold d-flex align-center justify-start" rounded="lg" size="large"
             @click="openReminderDialog">
        {{ t('actions.createReminder') }}
      </v-btn>
      <v-btn data-cy="scan-document-button" key="3" color="error" prepend-icon="mdi-folder-upload-outline"
             class="text-capitalize font-weight-bold" rounded="lg" size="large"
             @click="openScanDocumentDialog">
        {{ t('actions.scanDocument') }}
      </v-btn>
    </v-speed-dial>

    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-0 h-100">
        <slot/>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import {useUserStore} from "~/store/userStore";
import MoleculesUserMenu from "~/components/molecules/UserMenu.vue";
import CreateMedicationDialog from "~/components/molecules/createMedicationDialog.vue"
import ReminderCreationDialog from "~/components/molecules/ReminderCreationDialog.vue"
import {openToast, type ToastType} from "~/composables/openToast"
import {getCurrentUser} from "vuefire"
import {storeToRefs} from "pinia"
import {useCountryStore} from "~/store/country"
import type {Medication} from "~/types/medication";
import {useMedicationsStore} from "~/store/medications";
import type {CreateReminderRequest} from "~/types/reminder";
import {useReminderStore} from "~/store/reminder";
import CountryDialog from "~/components/molecules/CountryDialog.vue";
import {useLanguageStore} from "~/store/language";
import DocumentScannerDialog, {type UploadDocumentsData} from "~/components/molecules/DocumentScannerDialog.vue";
import {useDocumentsStore} from "~/store/documents";

const {t} = useI18n()
const {$open, $device} = useNuxtApp()
const {selectedCountry} = storeToRefs(useCountryStore())
const medicationStore = useMedicationsStore()
const reminderStore = useReminderStore()
const countryStore = useCountryStore()
const notifications = useNotifications()
const langStore = useLanguageStore()
langStore.initLocale()
const docStore = useDocumentsStore()
const pdfService = usePdfService()


const checkCountryStatus = async () => {
  if (countryStore.selectedCountry === null) {
    const result = await $open<string | null>(CountryDialog, {
      scrim: true,
      isPersistent: true
    })

    if (result === 'FR') {
      countryStore.confirmFrance()
    } else {
      countryStore.clearCountry()
    }
  }
}

onMounted(async () => {
  medicationStore.initMedications()
  await reminderStore.initReminders()
  await checkCountryStatus()
  await notifications.registerNotificationToken()
  notifications.listenForMessages()
})

const userStore = useUserStore()
const isDialOpen = ref(false)

const drawer = ref(false)
const {medications} = storeToRefs(medicationStore)

const validMedications = computed(() =>
    medications.value?.filter(m => !m.expired) ?? []
)
const openAddMedicationDialog = async () => {
  const user = await getCurrentUser()
  const toastType = await $open<ToastType>(CreateMedicationDialog, {
    scrim: true,
    isPersistent: true,
    createMedication: async (med: Medication) => await medicationStore.createMedication(med),
    userUid: user?.uid,
    email: user?.email,
    medications: medications.value,
    selectedCountry: selectedCountry.value,
  })
  if (toastType && toastType !== 'canceled') openToast(toastType, t(toastType))
}

const openReminderDialog = async () => {
  const toastType = await $open<ToastType>(ReminderCreationDialog, {
    scrim: true,
    isPersistent: true,
    createReminder: async (req: CreateReminderRequest) => {
      await reminderStore.createSchedule(req)
    },
    validMedications: validMedications.value,
    reminders: reminderStore.reminders
  })
  if (toastType && toastType !== 'canceled') openToast(toastType, t(`reminderDialog.toast.${toastType}`))
}

const openScanDocumentDialog = async () => {
  const toastType = await $open<'success' | 'canceled' | 'error'>(DocumentScannerDialog, {
    scrim: true,
    isPersistent: true,
    userFolders: docStore.existingFolders,

    uploadAction: async ({folder, name, files}: UploadDocumentsData) => {
      const isPdfMode = files.every((f) => f.type === 'application/pdf')

      if (isPdfMode) {
        for (let i = 0; i < files.length; i++) {
          let finalName: string

          if (name && name.trim() !== '') {
            finalName = files.length > 1 ? `${name}_${i + 1}` : name
          } else {
            finalName = files[i].name.replace(/\.[^/.]+$/, "")
          }

          await docStore.uploadDocument(folder, finalName, files[i])
        }
      } else {
        const finalBlob = await pdfService.generatePdf(files)
        await docStore.uploadDocument(folder, name, finalBlob)
      }
    }
  })

  if (toastType && toastType !== 'canceled') {
    openToast(toastType, t(`scanDocumentDialog.toast.${toastType}`))
  }
}

</script>

<style scoped>
.app-title-text {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.app-title-icon :deep(svg) {
  width: 28px !important;
  height: 28px !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>