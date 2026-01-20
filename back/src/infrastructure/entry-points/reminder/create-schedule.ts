import { onCall } from 'firebase-functions/v2/https'
import { CreateSchedule } from '../../../application/usecases/reminder/create-schedule'
import { $firebaseConnector } from '../../config/firebase'
import { FirestoreReminderRepositoryAdapter } from '../../adapters/scheduler/FirestoreReminderRepositoryAdapter'

export const createSchedule = onCall({ region: 'europe-west3' }, async (request) => {
    const reminderRepo = new FirestoreReminderRepositoryAdapter($firebaseConnector)
    const useCase = new CreateSchedule(reminderRepo)
    await useCase.execute(request.auth?.uid!, request.data)
    return { success: true }
})
