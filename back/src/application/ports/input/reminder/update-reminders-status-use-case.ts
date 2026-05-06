import { ReminderStatus } from '../../../../domain/entities/reminder'

export interface LowStockInfo {
    medicationName: string
    remainingQuantity: number
}

export interface UpdateRemindersStatusUseCase {
    execute(ids: string[], status: ReminderStatus, isAppActive?: boolean): Promise<LowStockInfo[]>
}
