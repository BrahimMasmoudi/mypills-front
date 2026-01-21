import { defineStore } from 'pinia'
import { httpsCallable } from 'firebase/functions'
import { collection, query, where, orderBy } from 'firebase/firestore'
import { useCollection, getCurrentUser } from 'vuefire'
import type { CreateReminderRequest, Reminder, ReminderGroup } from '~/types/reminder'
import { logEvent } from '@firebase/analytics'

export const useReminderStore = defineStore('reminder', () => {
    const { $functions, $firestore, $analytics } = useNuxtApp()

    // 1. Set up a source ref that useCollection will populate
    const reminderSource = ref<any[]>([])
    const loading = ref(false)

    const initReminders = async () => {
        const user = await getCurrentUser()
        if (!user) return

        const q = query(
            collection($firestore, 'reminders'),
            where('userId', '==', user.uid),
            orderBy('scheduledTime', 'desc')
        )

        // Bind the source directly to the collection
        // VueFire will now update reminderSource automatically in real-time
        useCollection(q, { target: reminderSource })
    }

    // 2. Create a computed property to handle the Date conversion
    // This ensures the rest of your app sees JS Dates, not Firestore Timestamps
    const reminders = computed(() => {
        return reminderSource.value.map((doc) => ({
            ...doc,
            reminderId: doc.id,
            scheduledTime: doc.scheduledTime?.toDate ? doc.scheduledTime.toDate() : new Date(doc.scheduledTime),
        })) as Reminder[]
    })

    const createSchedule = async (payload: CreateReminderRequest) => {
        loading.value = true
        try {
            const callCreateSchedule = httpsCallable<CreateReminderRequest, {
                success: boolean
            }>($functions, 'createReminder')
            const result = await callCreateSchedule(payload)

            // Analytics for creating a schedule
            if ($analytics) {
                logEvent($analytics, 'create_schedule', {
                    sickness_name: payload.sicknessName,
                    medication_name: payload.medication.name,
                    start_date: payload.startDate,
                    end_date: payload.endDate,
                    dose_count: payload.doses.length,
                })
            }

            return result.data
        } finally {
            loading.value = false
        }
    }

    const deleteReminder = async (reminderGroup: ReminderGroup) => {
        const ids = reminderGroup.ids
        const remove = httpsCallable($functions, 'deleteReminders')
        await remove(ids)
        if ($analytics) {
            ids.forEach((id) => {
                logEvent($analytics, 'delete_reminder', {
                    sickness_name: reminderGroup.sicknessName,
                    medication_name: reminderGroup.medName,
                    reminder_id: id,
                })
            })
        }
    }

    return {
        reminders, // This is now a computed reactive array
        loading,
        initReminders,
        createSchedule,
        deleteReminders: deleteReminder,
    }
})
