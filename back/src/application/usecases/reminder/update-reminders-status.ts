import { ReminderRepository } from '../../../domain/repositories/reminder/reminder-repository'
import { UpdateRemindersStatusUseCase } from '../../ports/input/reminder/update-reminders-status-use-case'

export class UpdateRemindersStatus implements UpdateRemindersStatusUseCase {
    constructor(private reminderRepo: ReminderRepository) {
    }

    async execute(ids: string[], status: 'pending' | 'sent' | 'failed'): Promise<void> {
        await this.reminderRepo.updateRemindersStatus(ids, status)
    }
}
