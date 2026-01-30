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
                    channelId: 'medication_reminders',
                    sound: 'default',
                    priority: 'max',
                    clickAction: 'OPEN_ACTIVITY__OR_PWA_URL'
                },
            },
            webpush: {
                headers: {
                    Urgency: 'high'
                },
                notification: {
                    icon: '/icon_x192.png',
                    tag: 'medication-notification'
                }
            }
        })
    }
}
