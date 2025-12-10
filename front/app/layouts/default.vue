<template>
  <v-app class="rounded rounded-md">
    <v-app-bar elevation="1">
      <template #title>
        <div class="d-flex align-center">
          <nuxt-icon name="application-icon" filled class="app-title-icon mr-1"/>
          <span class="app-title-text">{{ t('title') }}</span>
        </div>
      </template>
      <div v-if="userStore.user" class="mr-2">
        <v-menu location="bottom end" transition="slide-y-transition" :offset="8">
          <template v-slot:activator="{ props }">
            <v-btn
                v-bind="props"
                variant="text"
                rounded="xl"
                class="text-none px-2"
                height="48"
            >
              <v-avatar size="32" class="mr-2" color="primary">
                <v-img 
                  v-if="userStore.user.photoURL" 
                  :src="userStore.user.photoURL" 
                  cover
                />
                <v-icon v-else icon="mdi-account" color="white" />
              </v-avatar>
              
              <div v-if="$device.isDesktop" class="d-flex flex-column align-start mr-2">
                <span class="text-subtitle-2 font-weight-bold line-height-1 text-capitalize">
                  {{ userStore.user.displayName }}
                </span>
              </div>

              <v-icon
                  v-if="$device.isDesktop"
                  icon="mdi-chevron-down"
                  size="small"
                  color="medium-emphasis"
              />
            </v-btn>
          </template>

          <v-card min-width="280" rounded="lg" elevation="4" class="mt-2">
            <div class="pa-4 d-flex align-center bg-grey-lighten-5">
            <v-avatar size="36" class="mr-7" color="primary">
                <v-img 
                  v-if="userStore.user.photoURL" 
                  :src="userStore.user.photoURL" 
                  cover
                />
                <v-icon v-else icon="mdi-account" color="white" />
              </v-avatar>
              <div class="d-flex flex-column overflow-hidden">
                <span class="text-subtitle-1 font-weight-bold text-truncate text-capitalize">
                  {{ userStore.user.displayName }}
                </span>
                <span class="text-caption text-medium-emphasis text-truncate">
                  {{ userStore.user.email }}
                </span>
              </div>
            </div>

            <v-divider />

            <v-list density="comfortable" nav class="pa-2">
              <v-list-item
                  value="disconnect"
                  rounded="lg"
                  @click="handleSignOut"
                  color="error"
                  class="mb-0"
              >
                <template #prepend>
                  <v-icon icon="mdi-logout" color="error" class="mr-2" size="small" />
                </template>
                <v-list-item-title class="text-error">
                  {{ t('user-menu.disconnect') }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </div>
    </v-app-bar>
    <v-main>
      <slot/>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import {useUserStore} from "~/store/userStore";

const userStore = useUserStore()
const {t} = useI18n()
const { $device } = useNuxtApp()

const handleSignOut = async () => {
  await userStore.logOut()
  navigateTo('/login')
}
</script>

<style scoped>
.app-title-text {
  font-family: 'Roboto', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #1a1a1a;
}

.app-title-icon {
  font-size: 1.75rem;
  color: #3643BA;
}

.app-title-icon :deep(svg) {
  width: 28px !important;
  height: 28px !important;
}

.line-height-1 {
  line-height: 1;
}
</style>