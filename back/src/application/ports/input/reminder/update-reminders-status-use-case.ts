export interface UpdateRemindersStatusUseCase {
    execute(ids: string[], status: 'pending' | 'sent' | 'failed'): Promise<void>
}
