import { Reminder } from '../../../../domain/entities/reminder'

export interface DeleteReminderUseCase {
    execute(reminder: Reminder): Promise<void>
}
