import { getMessaging } from 'firebase-admin/messaging'
import { NotificationGateway } from '../../../domain/gateway/reminder/notification-gateway'

export class FirebaseFcmAdapter implements NotificationGateway {
    async sendMedicationReminder(token: string, medName: string, quantity: string): Promise<void> {
        await getMessaging().send({
            token,
            data: {
                medName: medName,
                quantity: String(quantity),
            },
        })
    }
}
