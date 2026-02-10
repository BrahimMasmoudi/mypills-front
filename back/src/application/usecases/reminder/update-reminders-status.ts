import { ReminderRepository } from '../../../domain/repositories/reminder/reminder-repository'
import { UpdateRemindersStatusUseCase } from '../../ports/input/reminder/update-reminders-status-use-case'
import { TaskSchedulerPort } from '../../../domain/gateway/scheduler/task-scheduler-port'
import { ReminderStatus } from '../../../domain/entities/reminder'

export class UpdateRemindersStatus implements UpdateRemindersStatusUseCase {
    constructor(
        private reminderRepo: ReminderRepository,
        private taskScheduler: TaskSchedulerPort
    ) {
    }

    async execute(ids: string[], status: ReminderStatus): Promise<void> {
        await this.reminderRepo.updateRemindersStatus(ids, status)

        if (status === 'done') {
            await Promise.all(ids.map(async (id) => {
                const reminder = await this.reminderRepo.getById(id)
                if (reminder) {
                    await this.taskScheduler.cancelNotificationTask(id, reminder.scheduledTime)
                }
            }))
        }
    }
}
