import { Reminder } from '../../../../domain/entities/reminder'

export interface ScheduleReminderExecutionUseCase {
    execute(reminder: Reminder): Promise<void>
}
