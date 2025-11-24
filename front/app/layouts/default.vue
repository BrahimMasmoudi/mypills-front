<template>
  <v-app class="rounded rounded-md">
    <v-app-bar :title="t('title')">
      <v-sheet v-if="userStore.user"
               class="mr-4 d-flex flex-column justify-center align-center condensed"
               style="cursor: pointer">
        <v-avatar size="36" color="primary" class="font-weight-bold">
          {{ userStore.user!.displayName[0].toUpperCase() }}
          <v-menu activator="parent" location="bottom">
            <v-list>
              <v-list-item min-height="20" @click="handleSignOut">
                <template #title>
            <span class="text-subtitle-2">
                Sign out
            </span>
                </template>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-avatar>
      </v-sheet>
    </v-app-bar>
    <v-navigation-drawer>
      <v-list>
        <v-list-item title="Voir tout" to="/all"></v-list-item>
        <v-list-item title="voir medicament expiré" to="/expired"></v-list-item>
        <v-list-item title="voir medicament courant" to="/valid"></v-list-item>
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

const handleSignOut = async () => {
  await userStore.logOut()
  navigateTo('/login')
}
</script>