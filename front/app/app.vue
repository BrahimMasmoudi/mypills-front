<template>
  <NuxtLayout name="default">
    <NuxtLoadingIndicator color="primary"/>
    <NuxtPage/>
  </NuxtLayout>
</template>
<script setup lang="ts">
import {useUserStore} from "~/store/userStore";
const user = useUserStore()
await user.callFunction()
</script>