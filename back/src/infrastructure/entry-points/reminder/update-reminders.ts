import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { $firebaseConnector } from '../../config/firebase'
import { FirestoreReminderRepositoryAdapter } from '../../adapters/reminder/FirestoreReminderRepositoryAdapter'
import { UpdateRemindersStatus } from '../../../application/usecases/reminder/update-reminders-status'
import { createSchedulerAdapter } from '../../config/scheduler'

export const updateRemindersStatus = onCall({ region: 'europe-west3', enforceAppCheck: true }, async (request) => {
    const { ids, status, isAppActive } = request.data

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
    const medicationRepo = new (await import('../../adapters/persistence/firestore-medication-repository-adapter')).FirestoreMedicationRepositoryAdapter($firebaseConnector)
    const userRepo = new (await import('../../adapters/user/firestore-user-repository-adapter')).FirestoreUserRepositoryAdapter($firebaseConnector)
    const notificationGateway = new (await import('../../adapters/messaging/firebase-fcm-adapter')).FirebaseFcmAdapter()

    const useCase = new UpdateRemindersStatus(reminderRepo, scheduler, medicationRepo, userRepo, notificationGateway)

    const lowStockItems = await useCase.execute(ids, status, isAppActive)

    return { success: true, lowStockItems }
})
