import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { $firebaseConnector } from '../../config/firebase'
import { FirestoreReminderRepositoryAdapter } from '../../adapters/reminder/FirestoreReminderRepositoryAdapter'
import { UpdateRemindersStatus } from '../../../application/usecases/reminder/update-reminders-status'
import { createSchedulerAdapter } from '../../config/scheduler'

export const updateRemindersStatus = onCall({ region: 'europe-west3', enforceAppCheck: true }, async (request) => {
    const { ids, status } = request.data

    // Validation
    if (!Array.isArray(ids)) {
        throw new HttpsError('invalid-argument', 'The function must be called with an array of IDs.')
    }

    const validStatuses = ['pending', 'done', 'failed']
    if (!validStatuses.includes(status)) {
        throw new HttpsError('invalid-argument', 'Invalid status provided.')
    }

    const scheduler = createSchedulerAdapter()
    const reminderRepo = new FirestoreReminderRepositoryAdapter($firebaseConnector, scheduler)
    const useCase = new UpdateRemindersStatus(reminderRepo, scheduler)

    await useCase.execute(ids, status)

    return { success: true }
})
