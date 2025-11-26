<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card
        :color="isExpired ? '#FF000090' : ''"
        :class="{ 'on-hover': isHovering, 'hover-filter': isHovering }"
        :elevation="isHovering ? 12 : 2"
        v-bind="props"
        class="d-flex flex-column align-center justify-center px-4 pt-7 pb-11"
        height="165px">
      <nuxt-icon filled :name="medication.image" class="mb-3"/>
      
      <v-text-field
      v-model="editedName"
      :readonly="!isEditing"
      variant="plain"
      hide-details
      class="medication-name-field w-100 mt-n2 text-center"
      @click="!isEditing && startEdit()" >
        <template #append-inner>
          <v-icon
            v-if="isHovering"
            :icon="isEditing ? 'mdi-check' : 'mdi-pencil'"
            size="small"
            @click.stop="toggleEdit"
            class="edit-icon"
          />
        </template>
      </v-text-field>

      <v-badge color="red" offset-x="-130" offset-y="-85" style="min-height: 12px;">
        <template #badge>
          {{ medication.quantity }}
        </template>
      </v-badge>
      <span class="mt-n2">
      {{ parseDate(medication.expiryDate) }}
      </span>
      <div class="align-self-center"
           style="position: absolute;top: 75%;">
        <v-btn
            v-for="(button, index) in buttons"
            :key="index"
            :disabled="button.disabled"
            class="mb-2"
            :class="{'show-btns': isHovering }"
            :color="isHovering ? '#FF000090' : 'transparent'"
            :icon="button.icon"
            @click="button.onClick"
            variant="text"
        />
      </div>
    </v-card>

  </v-hover>
</template>
<script setup lang="ts">
import type {Medication} from "~/types/medication";
import {parseDate} from "~/composables/parseDate";
import ValidationWithWarningDialog from "~/components/molecules/ValidationWithWarningDialog.vue";
import {useI18n} from "vue-i18n";

const {$open} = useNuxtApp()
const {t} = useI18n()
const {medication, incrementPills, decrementPills, deletePills, updateMedicationName} = defineProps<{
  medication: Medication
  isExpired: boolean
  incrementPills: (medication: Medication) => Promise<void>
  decrementPills: (medication: Medication) => Promise<void>
  deletePills: (medication: Medication) => Promise<void>
  updateMedicationName: (medication: Medication, newName: string) => Promise<void>
}>()

const isEditing = ref(false)
const editedName = ref(medication.name)

const startEdit = () => {
  isEditing.value = true
}

const toggleEdit = async () => {
  if (isEditing.value) {
    // Save the changes
    if (editedName.value.trim() && editedName.value !== medication.name) {
      await updateMedicationName(medication, editedName.value.trim())
    } else {
      editedName.value = medication.name // Reset if empty or unchanged
    }
    isEditing.value = false
  } else {
    startEdit()
  }
}
const buttons = computed(() => [
  {
    disabled: medication.quantity === 1,
    icon: 'mdi-minus',
    onClick: () => decrementPills(medication)
  },
  {
    disabled: false,
    icon: 'mdi-delete',
    onClick: async () => {
      const toastType = await $open<ToastType>(ValidationWithWarningDialog, {
        scrim: true,
        isPersistent: true,
        title: t('dialogDelete.title'),
        message: t('dialogDelete.message')
      })
      switch (toastType) {
        case 'success' : {
          await deletePills(medication)
          openToast(toastType, t(`dialogDelete.${toastType}`))
          break
        }
        case 'error' : {
          openToast(toastType, t(`dialogDelete.${toastType}`))
          break
        }
        case 'canceled' :
          break
      }
    }
  },
  {
    disabled: false,
    icon: 'mdi-plus',
    onClick: () => incrementPills(medication)
  }
])
</script>

<style scoped>
:deep(svg) {
  width: 48px !important;
  height: 48px !important;
}

.v-card {
  transition: all .3s ease-in-out;
  transform: scale(1);
}

.v-card.hover-filter {
  transform: scale(1.03);
  box-shadow: 0 8px 24px rgba(54, 67, 186, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1);
}

.show-btns {
  color: red !important;
}

.medication-name-field :deep(.v-field__input) {
  font-weight: 700;
}

/* NEW: Rule to center the text input */
.medication-name-field.text-center :deep(.v-field__input) {
  text-align: center;
}

.edit-icon {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.edit-icon:hover {
  opacity: 1;
}

.medication-name-field.editing :deep(.v-field) {
  background-color: rgba(54, 67, 186, 0.05);
  border-radius: 4px;
}
</style>