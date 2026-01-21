import { defineStore } from 'pinia'
import { httpsCallable } from 'firebase/functions'
import { collection, query, where, orderBy } from 'firebase/firestore'
import { useCollection, getCurrentUser } from 'vuefire'
import type { CreateReminderRequest, Reminder } from '~/types/reminder'

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
            const callCreateSchedule = httpsCallable<CreateReminderRequest, { success: boolean }>($functions, 'createReminder')
            return (await callCreateSchedule(payload)).data
        } finally {
            loading.value = false
        }
    }

    const deleteReminder = async (reminder: Reminder) => {
        const remove = httpsCallable($functions, 'deleteReminder')
        await remove(reminder)
    }

    return {
        reminders, // This is now a computed reactive array
        loading,
        initReminders,
        createSchedule,
        deleteReminder,
    }
})
