import { getMessaging } from 'firebase-admin/messaging'
import { NotificationGateway } from '../../../domain/gateway/scheduler/notification-gateway'

export class FirebaseFcmAdapter implements NotificationGateway {
    async sendMedicationReminder(token: string, medName: string, quantity: string): Promise<void> {
        await getMessaging().send({
            token,
            data: {
                medName: medName,
                quantity: String(quantity),
            },
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    priority: 'max',
                },
            },
            webpush: {
                headers: {
                    Urgency: 'high'
                }
            }
        })
    }
}
