<template>
  <v-menu location="bottom end" transition="slide-y-transition" :offset="8">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon :ripple="false" height="48">
        <v-avatar size="32" color="primary">
          <v-img v-if="userStore.user?.photoURL" :src="userStore.user.photoURL" cover />
          <v-icon v-else icon="mdi-account" color="white"/>
        </v-avatar>
      </v-btn>
    </template>

    <v-card min-width="280" rounded="lg" elevation="4" class="mt-2 overflow-hidden">
      <div class="pa-4 d-flex align-center">
        <v-avatar size="36" class="mr-4" color="primary">
          <v-img v-if="userStore.user?.photoURL" :src="userStore.user.photoURL" cover />
          <v-icon v-else icon="mdi-account" color="white"/>
        </v-avatar>
        <div class="d-flex flex-column overflow-hidden">
          <span class="text-subtitle-1 font-weight-bold text-truncate text-capitalize line-height-1">
            {{ userStore.user?.displayName }}
          </span>
          <span class="text-caption text-medium-emphasis text-truncate">
            {{ userStore.user?.email }}
          </span>
        </div>
      </div>

      <v-divider/>

      <v-list density="comfortable" nav class="pa-2">
        <v-list-item
            value="theme"
            rounded="lg"
            color="primary"
            @click="toggleColorMode"
            class="mb-1"
        >
          <template #prepend>
            <v-icon :color="colorMode.value === 'dark' ? 'amber' : 'black'" class="mr-2">
              {{ colorMode.value === 'dark' ? 'mdi-brightness-3' : 'mdi-brightness-5' }}
            </v-icon>
          </template>
          <v-list-item-title class="font-weight-medium">
            {{ t('user-menu.change-theme') }}
          </v-list-item-title>
        </v-list-item>

        <v-list-item
            value="disconnect"
            rounded="lg"
            @click="handleSignOut"
            color="error"
        >
          <template #prepend>
            <v-icon icon="mdi-logout" color="error" class="mr-2"/>
          </template>
          <v-list-item-title>
            {{ t('user-menu.disconnect') }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { useUserStore } from "~/store/userStore";
import { useI18n } from "vue-i18n";
import { useTheme } from 'vuetify'

const userStore = useUserStore()
const { t, locale } = useI18n()
const theme = useTheme()
const colorMode = useColorMode()

const langMenu = ref(false)

const handleSignOut = async () => {
  await userStore.logOut()
  navigateTo('/login')
}

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light'
}

// CRITICAL: This syncs the Nuxt Color Mode class to the Vuetify engine
watch(() => colorMode.value, (val) => {
  theme.global.name.value = val
}, { immediate: true })
</script>

<style scoped>
.line-height-1 {
  line-height: 1;
}
</style>
