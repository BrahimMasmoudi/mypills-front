import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { Reminder } from '../../../domain/entities/reminder'
import { ScheduleExecution } from '../../../application/usecases/reminder/schedule-execution'
import { GoogleCloudTaskSchedulerAdapter } from '../../adapters/scheduler/google-cloud-task-scheduler-adapter'

export const scheduleReminderTask = onDocumentCreated({
    document: 'reminders/{id}',
    region: 'europe-west3',
}, async (event) => {
    const data = event.data?.data()
    if (!data) return

    const project = process.env.GCLOUD_PROJECT!
    const location = 'europe-west3'

    const schedulerAdapter = new GoogleCloudTaskSchedulerAdapter(
        process.env.GCLOUD_PROJECT!,
        location,
        'reminder',
        `https://${location}-${project}.cloudfunctions.net/sendFCMNotification`,
        `${process.env.GCLOUD_PROJECT}@appspot.gserviceaccount.com`
    )

    // Map Firestore data to Domain Entity
    const reminder: Reminder = {
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
