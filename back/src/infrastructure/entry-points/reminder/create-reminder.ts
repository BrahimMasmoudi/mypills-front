import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { CreateReminder } from '../../../application/usecases/reminder/create-reminder'
import { $firebaseConnector } from '../../config/firebase'
import { FirestoreReminderRepositoryAdapter } from '../../adapters/reminder/FirestoreReminderRepositoryAdapter'

export const createReminder = onCall({ region: 'europe-west3' }, async (request) => {
   if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'no user found for this request.')

    const reminderRepo = new FirestoreReminderRepositoryAdapter($firebaseConnector)
    const useCase = new CreateReminder(reminderRepo)
    await useCase.execute(request.auth?.uid, request.data)
    return { success: true }
})
