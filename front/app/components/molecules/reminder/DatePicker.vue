<template>
  <v-menu v-model="dateMenu" :close-on-content-click="false" location="center">
    <template #activator="{ props }">
      <v-text-field
        v-bind="{ ...props, ...$attrs }"
        :model-value="dateRangeText"
        :label="t('reminderDialog.dateRange')"
        variant="outlined"
        readonly
        rounded="lg"
        prepend-inner-icon="mdi-calendar-range"
        class="font-weight-medium cursor-pointer"
        persistent-hint
        :hint="t('reminderDialog.maxDurationHint', { days: MAX_DURATION_DAYS })"
      />
    </template>
    <v-date-picker
      v-model="rangeValue"
      multiple="range"
      hide-header
      rounded="lg"
      color="primary"
      :min="minDate"
      :max="maxDate"
      @update:model-value="handleDateChange"
    />
  </v-menu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { isSameDay, format, addDays, differenceInDays } from 'date-fns'
import { enUS, fr } from 'date-fns/locale'

const { t, locale } = useI18n()
const locales: Record<string, any> = { en: enUS, fr: fr }
const MAX_DURATION_DAYS = 15

const startDate = defineModel<Date>('startDate', { required: true })
const endDate = defineModel<Date>('endDate', { required: true })

const dateMenu = ref(false)
const minDate = new Date()
const maxDate = addDays(minDate, MAX_DURATION_DAYS - 1)

// Internal range value for the picker
const rangeValue = ref<Date[]>([startDate.value, endDate.value])

const formatDate = (date: Date | string) => {
  if (!date) return ''
  return format(new Date(date), 'dd MMM yyyy', { locale: locales[locale.value] || enUS })
}

const dateRangeText = computed(() => {
  if (isSameDay(startDate.value, endDate.value)) {
    return formatDate(startDate.value)
  }
  return `${formatDate(startDate.value)} - ${formatDate(endDate.value)}`
})

const handleDateChange = (val: Date[]) => {
  if (!val || val.length === 0) return

  if (val.length === 1) {
    startDate.value = val[0]!
    endDate.value = val[0]!
  } else if (val.length >= 2) {
    const sorted = [...val].sort((a, b) => a.getTime() - b.getTime())
    const start = sorted[0]!
    let end = sorted[sorted.length - 1]!

    if (differenceInDays(end, start) >= MAX_DURATION_DAYS) {
      end = addDays(start, MAX_DURATION_DAYS - 1)
    }

    startDate.value = start
    endDate.value = end
    rangeValue.value = [start, end]
    dateMenu.value = false
  }
}

// Watch for external changes to reset internal rangeValue
watch([startDate, endDate], ([newStart, newEnd]) => {
  rangeValue.value = [newStart, newEnd]
}, { immediate: true })

defineOptions({ inheritAttrs: false })
</script>
