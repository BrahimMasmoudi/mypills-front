import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { Reminder } from '../../../domain/entities/reminder'
import { ScheduleExecution } from '../../../application/usecases/scheduler/schedule-execution'
import { createSchedulerAdapter } from '../../config/scheduler'

export const scheduleReminderTask = onDocumentCreated({
    document: 'reminders/{id}',
    region: 'europe-west3',
}, async (event) => {
    const data = event.data?.data()
    if (!data) return

    const schedulerAdapter = createSchedulerAdapter()

    // Map Firestore data to Domain Entity
    const reminder: Reminder = {
        sicknessName: data.sicknessName || 'sickness',
        reminderId: event.params.id,
        userId: data.userId,
        medName: data.medName,
        quantity: data.quantity,
        scheduledTime: data.scheduledTime.toDate(),
        status: data.status,
    }

    const useCase = new ScheduleExecution(schedulerAdapter)
    await useCase.execute(reminder)
})

export const updateReminderTask = onDocumentUpdated({
    document: 'reminders/{id}',
    region: 'europe-west3',
}, async (event) => {
    const beforeData = event.data?.before.data()
    const afterData = event.data?.after.data()

    if (!beforeData || !afterData) return

    const beforeTime = beforeData.scheduledTime.toDate().getTime()
    const afterTime = afterData.scheduledTime.toDate().getTime()

    // Only reschedule if the scheduledTime has changed
    if (beforeTime === afterTime) return

    const schedulerAdapter = createSchedulerAdapter()

    // 1. Cancel the existing task
    await schedulerAdapter.cancelNotificationTask(event.params.id, beforeData.scheduledTime.toDate())

    // 2. Schedule a new task
    const reminder: Reminder = {
        sicknessName: afterData.sicknessName || 'sickness',
        reminderId: event.params.id,
        userId: afterData.userId,
        medName: afterData.medName,
        quantity: afterData.quantity,
        scheduledTime: afterData.scheduledTime.toDate(),
        status: afterData.status,
    }

    const useCase = new ScheduleExecution(schedulerAdapter)
    await useCase.execute(reminder)
})
