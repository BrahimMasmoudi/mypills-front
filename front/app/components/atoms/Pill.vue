<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card
        :color="isExpired ? '#FF000090' : ''"
        :class="{ 'on-hover': isHovering }"
        :elevation="isHovering ? 12 : 2"
        v-bind="props"
        class="d-flex flex-column align-center justify-center position-relative px-4 pt-7 pb-11 "
        height="165px">
      <!-- Plus Icon Hover Area -->
      <nuxt-icon filled :name="medication.image" class="mb-2"/>
      <span class="font-weight-bold">
              {{ medication.name }}
      </span>

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
const {medication, incrementPills, decrementPills, deletePills} = defineProps<{
  medication: Medication
  isExpired: boolean
  incrementPills: (medication: Medication) => Promise<void>
  decrementPills: (medication: Medication) => Promise<void>
  deletePills: (medication: Medication) => Promise<void>
}>()
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
        title: t('title.delete'),
        message: t('message.delete')
      })
      switch (toastType) {
        case 'success' : {
          await deletePills(medication)
          openToast(toastType, t(`${toastType}.delete`))
          break
        }
        case 'error' : {
          openToast(toastType, t(`${toastType}.delete`))
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
  transition: opacity .4s ease-in-out;
}

.show-btns {
  color: red !important;
}
</style>
<i18n lang="yaml">
fr:
  title:
    delete: Es-tu sûr de vouloir supprimer ce médicament ?
  message:
    delete: Attention, la suppression du médicament est définitive et irréversible.

  success:
    delete: "Le médicament est supprimée avec succes"
  error:
    delete: "Échec lors de la suppression."
en:
  title:
    delete: Are you sure you want to delete this medicament ?
  message:
    delete: Please note, the deletion of the medicament is permanent and irreversible.

  success:
    delete: The medicament is deleted
  error:
    delete: Deletion failed. Try again

</i18n>