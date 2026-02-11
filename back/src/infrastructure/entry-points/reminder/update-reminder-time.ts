import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { $firebaseConnector } from '../../config/firebase'
import { FirestoreReminderRepositoryAdapter } from '../../adapters/reminder/FirestoreReminderRepositoryAdapter'
import { createSchedulerAdapter } from '../../config/scheduler'

export const updateReminderTime = onCall({ region: 'europe-west3' }, async (request) => {
    if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'no user found for this request.')

    const { id, newTime } = request.data
    if (!id || !newTime) throw new HttpsError('invalid-argument', 'id and newTime are required.')

    const scheduler = createSchedulerAdapter()
    const reminderRepo = new FirestoreReminderRepositoryAdapter($firebaseConnector, scheduler)

    await reminderRepo.updateReminderTime(id, new Date(newTime))

    return { success: true }
})
