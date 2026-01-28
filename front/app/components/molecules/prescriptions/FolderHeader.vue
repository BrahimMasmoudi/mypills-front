<template>
  <div class="d-flex align-center w-100 pr-2" style="min-width: 0;"> <v-icon icon="mdi-folder-account" color="primary" class="mr-2 mr-sm-4" />

    <div class="flex-grow-1 overflow-hidden mr-2">
      <v-text-field
          v-if="isEditing"
          v-model="localFolderName"
          density="compact"
          variant="plain"
          color="primary"
          hide-details
          :loading="isLoading"
          autofocus
          class="font-weight-bold"
          @click.stop
          @keyup.enter="save"
          append-inner-icon="mdi-check"
          @click:append-inner="save"
      />
      <span
          v-else
          class="text-subtitle-1 text-sm-h6 font-weight-bold text-truncate d-block"
      >
        {{ folderName }}
      </span>
    </div>

    <div class="d-flex align-center no-wrap flex-shrink-0">
      <v-chip
          size="x-small"
          variant="tonal"
          color="primary"
          class="mr-1 mr-sm-2 d-none d-xss-inline-flex"
      >
        {{ docCountLabel.split(' ')[0] }} </v-chip>

      <v-btn
          icon="mdi-pencil-outline"
          variant="text"
          color="primary"
          size="small"
          density="comfortable"
          @click.stop="toggleEdit"
      />
      <v-btn
          icon="mdi-delete-outline"
          variant="text"
          color="error"
          size="small"
          density="comfortable"
          @click.stop="$emit('delete', folderName)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ folderName: string; docCountLabel: string }>()
const emit = defineEmits(['rename', 'delete'])

const isEditing = ref(false)
const isLoading = ref(false)
const localFolderName = ref(props.folderName)

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  if (!isEditing.value) localFolderName.value = props.folderName
}

const save = () => {
  if (!localFolderName.value || localFolderName.value === props.folderName) {
    isEditing.value = false
    return
  }

  isLoading.value = true
  emit('rename', props.folderName, localFolderName.value, () => {
    isLoading.value = false
    isEditing.value = false
  })
}
</script>

<style scoped>
/* Ensures the container respects its parent's width */
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.no-wrap {
  white-space: nowrap;
}
:deep(.v-field__input) {
  padding : 8px 0;
}
</style>