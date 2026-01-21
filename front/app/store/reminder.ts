import { defineStore } from 'pinia'
import { httpsCallable } from 'firebase/functions'
import type { CreateReminderRequest } from '~/types/reminder'

export const useReminderStore = defineStore('reminder', () => {
    // State
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Actions
    const createSchedule = async (payload: CreateReminderRequest) => {
        loading.value = true
        error.value = null

        try {
            const { $functions } = useNuxtApp()

            // Reference the function.
            // Note: Region 'europe-west3' is handled by your plugin initialization
            const callCreateSchedule = httpsCallable<CreateReminderRequest, { success: boolean }>(
                $functions,
                'createSchedule'
            )

            const result = await callCreateSchedule(payload)

            return result.data
        } catch (err: any) {
            console.error('Error creating schedule:', err)
            error.value = err.message || 'Failed to create schedule'
            throw err // Re-throw so the component can handle it if needed
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        error,
        createSchedule,
    }
})
