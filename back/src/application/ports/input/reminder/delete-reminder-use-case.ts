import { ReminderId } from '../../../../domain/repositories/reminder/reminder-repository'

export interface DeleteReminderUseCase {
    execute(reminderIds: ReminderId[]): Promise<void>
}
