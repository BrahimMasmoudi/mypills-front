import {defineStore} from 'pinia'
import {httpsCallable} from 'firebase/functions'
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    deleteDoc,
    orderBy
} from 'firebase/firestore'
import type {CreateReminderRequest, Reminder} from '~/types/reminder'
import {getCurrentUser} from 'vuefire'

export const useReminderStore = defineStore('reminder', () => {
    const {$functions, $firestore} = useNuxtApp()

    const reminders = ref<Reminder[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchUserReminders = async () => {
        loading.value = true
        error.value = null

        try {
            const user = await getCurrentUser()
            if (!user) throw new Error('User not authenticated')

            const q = query(
                collection($firestore, 'reminders'),
                where('userId', '==', user.uid),
                orderBy('scheduledTime', 'desc')
            )

            const querySnapshot = await getDocs(q)

            reminders.value = querySnapshot.docs.map(doc => {
                const data = doc.data()
                return {
                    ...data,
                    reminderId: doc.id,
                    scheduledTime: data.scheduledTime?.toDate() || new Date()
                } as Reminder
            })

            return reminders.value
        } catch (err: any) {
            console.error('Error fetching reminders:', err)
            error.value = err.message
            return []
        } finally {
            loading.value = false
        }
    }

    const createSchedule = async (payload: CreateReminderRequest) => {
        loading.value = true
        error.value = null

        try {
            const callCreateSchedule = httpsCallable<CreateReminderRequest, { success: boolean }>(
                $functions,
                'createSchedule'
            )

            const result = await callCreateSchedule(payload)

            await fetchUserReminders()

            return result.data
        } catch (err: any) {
            console.error('Error creating schedule:', err)
            error.value = err.message || 'Failed to create schedule'
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteById = async (reminderId: string) => {
        try {
            const docRef = doc($firestore, 'reminders', reminderId)
            await deleteDoc(docRef)

            reminders.value = reminders.value.filter((r: Reminder) => r.reminderId !== reminderId)
        } catch (err: any) {
            error.value = 'Failed to delete reminder'
            throw err
        }
    }

    return {
        reminders,
        loading,
        error,
        fetchUserReminders,
        createSchedule,
        deleteById
    }
})