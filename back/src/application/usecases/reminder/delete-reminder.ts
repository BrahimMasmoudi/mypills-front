import { DeleteReminderUseCase } from '../../ports/input/reminder/delete-reminder-use-case'
import { ReminderRepository } from '../../../domain/repositories/reminder/reminder-repository'
import { Reminder } from '../../../domain/entities/reminder'

export class DeleteReminder implements DeleteReminderUseCase {
    constructor(private reminderRepo: ReminderRepository) {
    }

    async execute(reminder: Reminder): Promise<void> {
        return await this.reminderRepo.delete(reminder)
    }
}
