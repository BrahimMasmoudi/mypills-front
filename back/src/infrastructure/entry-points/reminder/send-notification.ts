import { FirestoreUserRepositoryAdapter } from '../../adapters/scheduler/firestore-user-repository-adapter'
import { onRequest } from 'firebase-functions/v2/https'
import { $firebaseConnector } from '../../config/firebase'
import { FirebaseFcmAdapter } from '../../adapters/messaging/firebase-fcm-adapter'
import { SendReminderNotification } from '../../../application/usecases/reminder/send-notification'

export const sendFCMNotification = onRequest({ region: 'europe-west3' }, async (req, res) => {
    const { userId, medName, quantity } = req.body

    const userRepo = new FirestoreUserRepositoryAdapter($firebaseConnector)
    const notificationGateway = new FirebaseFcmAdapter()
    const sendNotificationUseCase = new SendReminderNotification(userRepo, notificationGateway)

    try {
        await sendNotificationUseCase.execute({ userId, medName, quantity })

        res.status(200).json({ success: true })
    } catch (error) {
        console.error('Notification Error:', error)
        res.status(500).send(error)
    }
})
