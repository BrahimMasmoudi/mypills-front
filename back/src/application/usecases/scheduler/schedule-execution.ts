import { Reminder } from '../../../domain/entities/reminder'
import { TaskSchedulerPort } from '../../../domain/gateway/scheduler/task-scheduler-port'
import { ScheduleReminderExecutionUseCase } from '../../ports/input/scheduler/schedule-reminder-execution-use-case'

export class ScheduleExecution implements ScheduleReminderExecutionUseCase {
    constructor(private scheduler: TaskSchedulerPort) {
    }

    async execute(reminder: Reminder): Promise<void> {
        await this.scheduler.scheduleNotificationTask(
            reminder.reminderId,
            reminder.scheduledTime,
            {
                userId: reminder.userId,
                medName: reminder.medName,
                medicationId: reminder.medicationId,
                quantity: String(reminder.quantity),
                reminderId: reminder.reminderId,
            }
        )
    }
}
