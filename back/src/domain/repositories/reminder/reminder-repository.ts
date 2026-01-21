import { Reminder } from '../../entities/reminder'

export type ReminderId = Reminder['reminderId']

export interface ReminderRepository {
    saveBatch(reminders: Reminder[]): Promise<void>

    getById(id: string): Promise<Reminder | null>

    updateRemindersStatus(id: string[], status: 'pending' | 'sent' | 'failed'): Promise<void>

    nextId(): string

    delete(reminderIds: ReminderId[]): Promise<void>
}
