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

        <div class="d-flex align-center cursor-pointer" @click="navigateTo('/')">
          <nuxt-icon name="application-icon" filled class="app-title-icon mr-2"/>
          <span class="app-title-text text-primary">{{ t('title') }}</span>
        </div>

        <v-spacer/>

        <div v-if="userStore.user" class="d-flex align-center">
          <MoleculesUserMenu/>
        </div>
      </div>
    </v-app-bar>

    <v-navigation-drawer
        v-model="drawer"
        temporary
        elevation="0"
        border="e"
    >
      <v-list nav class="pa-4">
        <v-list-item
            to="/medications"
            rounded="pill"
            class="mb-2 nav-pill"
            active-class="active-pill"
            link
        >
          <template #prepend>
            <v-icon icon="mdi-pill" size="20" class="mr-n2"/>
          </template>

          <v-list-item-title class="font-weight-bold ml-4">
            {{ t('nav.medications') }}
          </v-list-item-title>
        </v-list-item>

        <v-list-item
            to="/reminders"
            rounded="pill"
            class="mb-2 nav-pill"
            active-class="active-pill"
            link
        >
          <template #prepend>
            <v-icon icon="mdi-calendar-clock" size="20" class="mr-n2"/>
          </template>

          <v-list-item-title class="font-weight-bold ml-4">
            {{ t('nav.reminders') }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-speed-dial v-model="isDialOpen" location="bottom end" transition="slide-y-reverse-transition" class="mb-4 mr-4">
      <template v-slot:activator="{ props: activatorProps }">
        <v-fab v-bind="activatorProps" color="primary" size="x-large" app :icon="isDialOpen ? 'mdi-close' : 'mdi-plus'"
               location="bottom end" :extended="!$device.isMobile" :text="!$device.isMobile ? t('add-pill') : ''"
               class="mb-4 mr-4"/>
      </template>
      <v-btn key="1" color="secondary" prepend-icon="mdi-pill" class="text-capitalize font-weight-bold" rounded="lg"
             size="large" @click="openAddMedicationDialog">
        {{ t('actions.addMedication') }}
      </v-btn>
      <v-btn key="2" color="primary" prepend-icon="mdi-alarm-plus" class="text-capitalize font-weight-bold" rounded="lg"
             size="large" @click="openReminderDialog">
        {{ t('actions.createReminder') }}
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

const {t} = useI18n()
const {$open, $device} = useNuxtApp()
const {selectedCountry} = storeToRefs(useCountryStore())
const medicationStore = useMedicationsStore()
const reminderStore = useReminderStore()
const countryStore = useCountryStore()
const notifications = useNotifications()


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
  await medicationStore.initMedications()
  await reminderStore.initReminders()
  await checkCountryStatus()
  await notifications.registerNotificationToken()
  notifications.listenForMessages()
})

const userStore = useUserStore()
const isDialOpen = ref(false)

const drawer = ref(false)

const medications = computed(() => medicationStore.medications)
const validMedication = computed(() => medications.value?.filter(m => !m.expired) ?? [])

const openAddMedicationDialog = async () => {
  const user = await getCurrentUser()
  const toastType = await $open<ToastType>(CreateMedicationDialog, {
    scrim: true,
    isPersistent: true,
    createMedication: async (med: Medication) => await medicationStore.createMedication(med),
    userUid: user?.uid,
    email: user?.email,
    medications: medications,
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
    validMedications: validMedication.value
  })
  if (toastType && toastType !== 'canceled') openToast(toastType, t(`reminderDialog.toast.${toastType}`))
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

/* Base Pill Style */
.nav-pill {
  transition: all 0.2s ease-in-out;
  color: rgba(var(--v-theme-on-surface), 0.6);
  min-height: 44px !important;
}

/* Active Pill Style */
.active-pill {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
  box-shadow: 0 4px 10px rgba(var(--v-theme-primary), 0.3);
}

/* Ensure icons turn white in the active pill */
.active-pill :deep(.v-icon) {
  color: white !important;
}

/* Reduce the gap specifically between the prepend slot and content */
:deep(.v-list-item__spacer) {
  width: 12px !important; /* Adjust this value to bring icon/text closer */
}

.cursor-pointer {
  cursor: pointer;
}
</style>