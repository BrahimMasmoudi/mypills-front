<template>
  <v-container>
    <v-card-title for="uname"><b>Username</b></v-card-title>
    <v-btn @click.prevent="login" class="button">Login with google</v-btn>
  </v-container>
</template>
<script lang="ts" setup>

import {useUserStore} from "~/store/userStore";

const userStore = useUserStore()
definePageMeta({
  layout: false,
})
if(userStore.user) navigateTo('/all')

const login = async () => {
  await userStore.login()
  navigateTo('/all')
};
</script>