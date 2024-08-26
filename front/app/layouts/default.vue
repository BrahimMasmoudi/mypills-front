<template>
  <v-layout class="rounded rounded-md">
    <v-app-bar :title="t('title')">
    </v-app-bar>

    <v-navigation-drawer>
      <v-list>
        <v-list-item title="Voir tout" to="/all"></v-list-item>
        <v-list-item title="voir medicament expiré" to="/expired"></v-list-item>
        <v-list-item title="voir medicament courant" to="/valid"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="d-flex align-center justify-center">
      <slot/>
    </v-main>
  </v-layout>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";

const {t} = useI18n()
</script>
<i18n>
fr:
  title: Bienvenu à MY PILLS
en:
  title: Welcome to MY PILLS
</i18n>