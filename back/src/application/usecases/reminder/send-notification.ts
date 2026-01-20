import { NotificationGateway } from '../../../domain/gateway/reminder/notification-gateway'
import { UserRepository } from '../../../domain/gateway/reminder/user-repository'

export interface SendNotificationCommand {
    userId: string
    medName: string
    quantity: string
}

export class SendReminderNotification {
    constructor(
        private userRepo: UserRepository,
        private notificationGateway: NotificationGateway
    ) {}

    async execute(command: SendNotificationCommand): Promise<void> {
        const token = await this.userRepo.getDeviceToken(command.userId)

        if (!token) {
            console.warn(`No FCM token found for user ${command.userId}`)
            return
        }

        await this.notificationGateway.sendMedicationReminder(
            token,
            command.medName,
            command.quantity
        )
    }
}
