<template>
  <TemplatesPills :filter="$route.params.filter as Filter"/>
</template>
<script setup lang="ts">

import type {Filter} from "~/types/Filter";
</script>

<style scoped>

</style>