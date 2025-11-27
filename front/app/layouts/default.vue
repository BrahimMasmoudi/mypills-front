<template>
  <v-app class="rounded rounded-md">
    <v-app-bar elevation="1">
      <template #title>
        <div class="d-flex align-center">
          <v-app-bar-nav-icon class="mr-2" :icon="drawer ? 'mdi-close' : 'mdi-menu'" @click.stop="drawer = !drawer" />
          <nuxt-icon name="pill-1" class="app-title-icon"/>
          <span class="app-title-text">{{ t('title') }}</span>
        </div>
      </template>
      <v-sheet v-if="userStore.user"
               class="mr-4 d-flex flex-column justify-center align-center condensed"
               style="cursor: pointer">
        <v-avatar size="36" color="primary" class="font-weight-bold">
          {{ userStore.user!.displayName[0].toUpperCase() }}
          <v-menu activator="parent" location="bottom">
            <v-card min-width="250" class="rounded-lg">
              <v-list>
                <v-list-item
                    :title="userStore.user.displayName"
                    :subtitle="userStore.user.email"
                >
                  <template #prepend>
                    <v-avatar color="primary" size="40">
                      <span class="text-h6 text-white">{{ userStore.user.displayName[0].toUpperCase() }}</span>
                    </v-avatar>
                  </template>
                </v-list-item>
              </v-list>

              <v-divider></v-divider>

              <v-list density="compact" nav class="d-flex align-center justify-center">
          
               <v-list-item :title="t('user-menu.disconnect')" value="disconnect" rounded="xl" @click="handleSignOut" color="error">
                  <template #prepend>
                    <nuxt-icon name="undo" class="mr-2"/>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </v-avatar>
      </v-sheet>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer">
      <v-list color="primary" class="pa-2 mt-2">
        <v-list-item :title="t('nav.all-medications')" to="/all" rounded="xl" class="mb-1">
          <template #prepend>
            <nuxt-icon name="pill-1" class="mr-4"/>
          </template>
        </v-list-item>
        <v-list-item :title="t('nav.valid-medications')" to="/valid" rounded="xl" class="mb-1">
          <template #prepend>
            <nuxt-icon name="validate-edit-action" class="mr-4"/>
          </template>
        </v-list-item>
        <v-list-item :title="t('nav.expired-medications')" to="/expired" rounded="xl" class="mb-1">
          <template #prepend>
            <nuxt-icon name="error-warning" class="mr-4"/>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
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
const drawer = ref(true)

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
</style>