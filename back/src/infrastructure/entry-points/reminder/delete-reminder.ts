import { onCall } from 'firebase-functions/v2/https'
import { $firebaseConnector } from '../../config/firebase'
import { FirestoreReminderRepositoryAdapter } from '../../adapters/reminder/FirestoreReminderRepositoryAdapter'
import { DeleteReminder } from '../../../application/usecases/reminder/delete-reminder'

export const deleteReminder = onCall({ region: 'europe-west3' }, async (request) => {
    const reminderRepo = new FirestoreReminderRepositoryAdapter($firebaseConnector)
    const useCase = new DeleteReminder(reminderRepo)
    await useCase.execute(request.data)
    return { success: true }
})
