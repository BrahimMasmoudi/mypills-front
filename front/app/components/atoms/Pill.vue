<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card
        v-if="$device.isDesktop"
        :color="isExpired ? '#FF000090' : ''"
        :class="{ 'on-hover': isHovering, 'hover-filter': isHovering }"
        :elevation="isHovering ? 12 : 2"
        v-bind="props"
        class="d-flex flex-column align-center justify-center px-4 pt-7 pb-11"
        height="190px">
      <nuxt-icon filled :name="medication.image" class="mb-3"/>

      <div v-if="!isEditing"
           class="d-flex align-center justify-center w-100 mt-n2 cursor-pointer"
           @click="startEdit">
        <span class="font-weight-bold text-h6">{{ medication.name }}</span>
        <v-icon
            v-if="isHovering"
            icon="mdi-pencil"
            size="small"
            class="ml-2 edit-icon"
        />
      </div>

      <v-text-field
          v-else
          v-model="editedName"
          variant="plain"
          hide-details
          class="medication-name-field w-100 mt-n2 text-center"
          autofocus
          @blur="toggleEdit"
          @keydown.enter="toggleEdit">
        <template #append-inner>
          <v-icon
              icon="mdi-check"
              size="small"
              @click.stop="toggleEdit"
              class="edit-icon"
          />
        </template>
      </v-text-field>

      <v-badge color="red"  offset-x="-160" offset-y="-95" style="min-height: 12px;">
        <template #badge>
          {{ medication.quantity }}
        </template>
      </v-badge>
      <span class="mt-n2 single-line">
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

    <v-card
        v-else
        :color="isExpired ? '#FF000090' : ''"
        :class="{ 'on-hover': showMobileMenu, 'hover-filter': showMobileMenu }"
        :elevation="showMobileMenu ? 12 : 2"
        v-bind="props"
        class="d-flex flex-column align-center justify-center px-4 py-4"
        @click="showMobileMenu = !showMobileMenu">
      <nuxt-icon filled :name="medication.image" class="mb-3"/>

      <div v-if="!isEditing"
           class="d-flex align-center justify-center w-100 mt-n2 cursor-pointer"
           @click.stop="startEdit">
        <span class="font-weight-bold text-subtitle-2 text-truncate">{{ medication.name }}</span>
        <v-icon
            v-if="showMobileMenu"
            icon="mdi-pencil"
            size="small"
            class="ml-2 edit-icon"
        />
      </div>

      <v-text-field
          v-else
          v-model="editedName"
          variant="plain"
          class="medication-name-field w-100 mt-n2 text-center"
          @blur="toggleEdit"
          @keydown.enter="toggleEdit">
        <template #append-inner>
          <v-icon
              icon="mdi-check"
              size="small"
              @click.stop="toggleEdit"
              class="edit-icon"
          />
        </template>
      </v-text-field>

      <v-badge color="red"  offset-x="-70" offset-y="-75" style="min-height: 12px;">
        <template #badge>
          {{ medication.quantity }}
        </template>
      </v-badge>
      <span class="mt-n2 single-line">
      {{ parseDate(medication.expiryDate) }}
      </span>
      <div v-if="showMobileMenu" class="d-flex align-center justify-center mt-2 w-100">
        <v-btn
            v-for="(button, index) in buttons"
            :key="index"
            :disabled="button.disabled"
            size="small"
            density="compact"
            class="mx-2"
            :class="{'show-btns': showMobileMenu }"
            :color="showMobileMenu ? '#FF000090' : 'transparent'"
            :icon="button.icon"
            @click.stop="button.onClick"
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

const {$open, $device} = useNuxtApp()
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
const showMobileMenu = ref(false)
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

.single-line {
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
}
.cursor-pointer {
  cursor: pointer;
}
</style>