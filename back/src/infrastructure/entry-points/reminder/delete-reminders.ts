import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { $firebaseConnector } from '../../config/firebase'
import { FirestoreReminderRepositoryAdapter } from '../../adapters/reminder/FirestoreReminderRepositoryAdapter'
import { DeleteReminders } from '../../../application/usecases/reminder/delete-reminders'

export const deleteReminders = onCall({ region: 'europe-west3' }, async (request) => {
    if (!Array.isArray(request.data)) {
        throw new HttpsError('invalid-argument', 'The function must be called with an array of IDs.')
    }
    const reminderRepo = new FirestoreReminderRepositoryAdapter($firebaseConnector)
    const useCase = new DeleteReminders(reminderRepo)
    await useCase.execute(request.data)
    return { success: true }
})
