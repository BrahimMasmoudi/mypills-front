import { DeleteReminderUseCase } from '../../ports/input/reminder/delete-reminder-use-case'
import { ReminderId, ReminderRepository } from '../../../domain/repositories/reminder/reminder-repository'

export class DeleteReminders implements DeleteReminderUseCase {
    constructor(private reminderRepo: ReminderRepository) {
    }

    async execute(reminderIds : ReminderId[]): Promise<void> {
        return await this.reminderRepo.delete(reminderIds)
    }
}
