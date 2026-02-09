import { defineStore } from 'pinia'
import { httpsCallable } from 'firebase/functions'
import { collection, query, where, orderBy } from 'firebase/firestore'
import { useCollection, getCurrentUser } from 'vuefire'
import type { CreateReminderRequest, Reminder, ReminderGroup } from '~/types/reminder'
import { logEvent } from '@firebase/analytics'

export const useReminderStore = defineStore('reminder', () => {
    const { $functions, $firestore, $analytics } = useNuxtApp()

    const reminderSource = ref<any[]>([])
    const sourceQuery = ref<any>(null)

    const collectionData = useCollection(() => sourceQuery.value, {
        target: reminderSource
    })

    const isLoading = computed(() => {
        if (!sourceQuery.value) return true
        return collectionData.pending.value
    })

    const initReminders = async () => {
        const user = await getCurrentUser()
        if (!user) return

        sourceQuery.value = query(
            collection($firestore, 'reminders'),
            where('userId', '==', user.uid),
            orderBy('scheduledTime', 'desc')
        )
    }

    const reminders = computed(() => {
        return reminderSource.value.map((doc) => ({
            ...doc,
            reminderId: doc.id,
            scheduledTime: doc.scheduledTime?.toDate ? doc.scheduledTime.toDate() : new Date(doc.scheduledTime),
        })) as Reminder[]
    })

    const createSchedule = async (payload: CreateReminderRequest) => {
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
    }

    const deleteReminders = async (reminderGroup: ReminderGroup) => {
        const ids = reminderGroup.ids
        const remove = httpsCallable($functions, 'deleteReminders')
        await remove(ids)
        if ($analytics) {
            ids.forEach((id) => {
                logEvent($analytics, 'delete_reminder', {
                    sickness_name: reminderGroup.sicknessName,
                    reminder_id: id,
                })
            })
        }
    }

    const updateRemindersStatus = async (ids: string[], status: 'sent' | 'failed') => {
        const callUpdate = httpsCallable($functions, 'updateRemindersStatus')
        await callUpdate({ ids, status })

        if ($analytics) {
            logEvent($analytics, 'update_reminder_status', {
                status,
                count: ids.length
            })
        }
    }

    const updateReminder = async (payload: any) => {
        const callUpdate = httpsCallable($functions, 'updateReminder')
        const result = await callUpdate(payload)

        if ($analytics) {
            logEvent($analytics, 'update_reminder', {
                old_sickness_name: payload.oldSicknessName,
                new_sickness_name: payload.newSicknessName,
                med_count: payload.medications.length
            })
        }

        return result.data
    }

    return {
        reminders, // This is now a computed reactive array
        isLoading,
        initReminders,
        createSchedule,
        deleteReminders,
        updateRemindersStatus,
        updateReminder
    }
})
