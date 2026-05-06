import { ReminderStatus } from '../../../../domain/entities/reminder'

export interface UpdateRemindersStatusUseCase {
    execute(ids: string[], status: ReminderStatus): Promise<void>
}
