<template>
  <v-card variant="outlined" class="rounded-lg hover-card">
    <div class="d-flex flex-column pa-3">
      <div class="d-flex align-center mb-2">
        <v-avatar color="primary-lighten-5" rounded="lg" size="48" class="mr-3">
          <v-icon icon="mdi-file-pdf-box" color="primary" size="32"/>
        </v-avatar>

        <div class="overflow-hidden flex-grow-1">
          <v-text-field
              v-if="isEditing"
              v-model="localName"
              density="compact"
              variant="underlined"
              hide-details
              class="text-subtitle-1 font-weight-bold"
              @keyup.enter="save"
              append-inner-icon="mdi-check"
              @click:append-inner="save"
          />
          <div v-else class="text-subtitle-1 font-weight-bold text-truncate">{{ doc.name }}</div>
          <div class="text-caption text-medium-emphasis">{{ formattedDate }}</div>
        </div>
      </div>
    </div>

    <v-divider/>

    <v-card-actions class="justify-end px-2 py-1">
      <v-btn icon="mdi-eye-outline" variant="text" color="primary" size="small" @click="$emit('view', doc.fileUrl)"/>
      <v-btn icon="mdi-pencil-outline" variant="text" color="grey-darken-1" size="small" @click="toggleEdit"/>
      <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="$emit('delete', doc)"/>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{ doc: any; formattedDate: string }>()
const emit = defineEmits(['view', 'delete', 'rename'])

const isEditing = ref(false)
const localName = ref(props.doc.name)

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  if (!isEditing.value) localName.value = props.doc.name
}

const save = () => {
  emit('rename', props.doc, localName.value)
  isEditing.value = false
}
</script>