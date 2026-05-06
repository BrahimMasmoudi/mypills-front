import { ReminderRepository } from '../../../domain/repositories/reminder/reminder-repository'
import { UpdateRemindersStatusUseCase } from '../../ports/input/reminder/update-reminders-status-use-case'
import { TaskSchedulerPort } from '../../../domain/gateway/scheduler/task-scheduler-port'
import { ReminderStatus } from '../../../domain/entities/reminder'
import { MedicationRepository } from '../../../domain/repositories/medication/medication-repository'
import { UserRepository } from '../../../domain/repositories/user/user-repository'
import { NotificationGateway } from '../../../domain/gateway/scheduler/notification-gateway'

export class UpdateRemindersStatus implements UpdateRemindersStatusUseCase {
    constructor(
        private reminderRepo: ReminderRepository,
        private taskScheduler: TaskSchedulerPort,
        private medicationRepo: MedicationRepository,
        private userRepo: UserRepository,
        private notificationGateway: NotificationGateway
    ) {
    }

    async execute(ids: string[], status: ReminderStatus, isAppActive: boolean = false): Promise<any[]> {
        await this.reminderRepo.updateRemindersStatus(ids, status)

        const lowStockItems: any[] = []

        if (status === 'done') {
            await Promise.all(ids.map(async (id) => {
                const reminder = await this.reminderRepo.getById(id)
                if (!reminder) return

                // Cancel scheduled task
                await this.taskScheduler.cancelNotificationTask(id, reminder.scheduledTime)

                // Decrement inventory
                if (reminder.medicationId) {
                    const auth = { uid: reminder.userId, token: {} } as any
                    const medication = await this.medicationRepo.get(reminder.medicationId, auth)

                    if (medication) {
                        const quantityToDecrement = Number(reminder.quantity) || 1
                        await this.medicationRepo.decrement(medication, auth, quantityToDecrement)

                        // Check for low stock
                        const updatedMed = await this.medicationRepo.get(reminder.medicationId, auth)
                        if (updatedMed && updatedMed.quantity <= 3) {
                            lowStockItems.push({
                                medicationName: medication.name,
                                remainingQuantity: updatedMed.quantity
                            })

                            // Only send push notification if NOT in app
                            if (!isAppActive) {
                                const token = await this.userRepo.getDeviceToken(reminder.userId)
                                if (token) {
                                    await this.notificationGateway.sendLowStockNotification(token, medication.name, updatedMed.quantity)
                                }
                            }
                        }
                    }
                }
            }))
        }

        return lowStockItems
    }
}
