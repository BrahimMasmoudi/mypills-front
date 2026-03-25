import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { CreateReminder } from '../../../application/usecases/reminder/create-reminder'
import { $firebaseConnector } from '../../config/firebase'
import { FirestoreReminderRepositoryAdapter } from '../../adapters/reminder/FirestoreReminderRepositoryAdapter'
import { createSchedulerAdapter } from '../../config/scheduler'

export const createReminder = onCall({ region: 'europe-west3', enforceAppCheck: true }, async (request) => {
    if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'no user found for this request.')

    const scheduler = createSchedulerAdapter()
    const reminderRepo = new FirestoreReminderRepositoryAdapter($firebaseConnector, scheduler)
    const useCase = new CreateReminder(reminderRepo)
    await useCase.execute(request.auth?.uid, request.data)
    return { success: true }
})
