import { onDocumentCreated } from 'firebase-functions/v2/firestore'
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
        sicknessName: 'sickness',
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
