import { Reminder } from '../../entities/reminder'

export type ReminderId = Reminder['reminderId']

export interface ReminderRepository {
    saveBatch(reminders: Reminder[]): Promise<void>

    getById(id: string): Promise<Reminder | null>

    updateStatus(id: string, status: 'sent' | 'failed'): Promise<void>

    nextId(): string

    delete(reminderIds: ReminderId[]): Promise<void>
}
