import { NotificationGateway } from '../../../../domain/gateway/scheduler/notification-gateway'
import { UserRepository } from '../../../../domain/repositories/user/user-repository'

export interface SendNotificationCommand {
    userId: string
    medName: string
    medicationId: string
    quantity: string
    reminderId: string
}

export class SendReminderNotification {
    constructor(
        private userRepo: UserRepository,
        private notificationGateway: NotificationGateway
    ) { }

    async execute(command: SendNotificationCommand): Promise<void> {
        const token = await this.userRepo.getDeviceToken(command.userId)

        if (!token) {
            console.warn(`No FCM token found for user ${command.userId}`)
            return
        }

        await this.notificationGateway.sendMedicationReminder(
            token,
            command.medName,
            command.medicationId,
            command.quantity,
            command.reminderId
        )
    }
}
