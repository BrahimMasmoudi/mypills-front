<template>
  <v-layout class="rounded rounded-md">
    <v-app-bar :title="t('title')">

    </v-app-bar>

    <v-navigation-drawer>
      <v-list>
        <v-list-item title="Navigation drawer"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="d-flex align-center justify-center" style="min-height: 300px;">
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
  title: Mes médicaments
en:
  title: My pills
</i18n>