import { getMessaging } from 'firebase-admin/messaging'
import { NotificationGateway } from '../../../domain/gateway/scheduler/notification-gateway'

export class FirebaseFcmAdapter implements NotificationGateway {
    async sendMedicationReminder(token: string, medName: string, medicationId: string, quantity: string, reminderId: string): Promise<void> {
        await getMessaging().send({
            token,
            data: {
                medName: medName,
                medicationId: medicationId,
                quantity: quantity,
                reminderId: reminderId
            },
            notification: {
                title: 'Medication Time 💊',
                body: `Take ${quantity}x ${medName}`
            },
            android: {
                priority: 'high',
                notification: {
                    channelId: 'medication_reminders',
                    sound: 'default',
                    priority: 'max',
                    visibility: 'public'
                },
            },
            webpush: {
                headers: {
                    Urgency: 'high'
                }
            }
        })
    }

    async sendLowStockNotification(token: string, medName: string, quantity: number): Promise<void> {
        await getMessaging().send({
            token,
            data: {
                type: 'low_stock',
                medName: medName,
                quantity: String(quantity)
            },
            android: {
                priority: 'high'
            }
        })
    }
}
