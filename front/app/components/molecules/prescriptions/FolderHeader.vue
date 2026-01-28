<template>
  <div class="d-flex align-center w-100 pr-4">
    <v-icon icon="mdi-folder-account" color="primary" class="mr-4"/>

    <v-text-field
        v-if="isEditing"
        v-model="localFolderName"
        density="compact"
        variant="underlined"
        color="primary"
        hide-details
        class="max-width-200 font-weight-bold"
        @click.stop
        @keyup.enter="save"
        append-inner-icon="mdi-check"
        @click:append-inner="save"
    />
    <span v-else class="text-h6 font-weight-bold">{{ folderName }}</span>

    <v-spacer/>

    <v-chip size="small" variant="tonal" color="primary" class="mr-2">
      {{ docCountLabel }}
    </v-chip>

    <v-btn icon="mdi-pencil-outline" variant="text" color="primary" size="small" @click.stop="toggleEdit"/>
    <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small"
           @click.stop="$emit('delete', folderName)"/>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ folderName: string; docCountLabel: string }>()
const emit = defineEmits(['rename', 'delete'])

const isEditing = ref(false)
const localFolderName = ref(props.folderName)

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  if (!isEditing.value) localFolderName.value = props.folderName
}

const save = () => {
  emit('rename', props.folderName, localFolderName.value)
  isEditing.value = false
}
</script>