import { Medication } from '../../../../domain/entities/medication'
import { AuthData } from 'firebase-functions/v2/tasks'

export interface SetExpiredStatusUseCase {
    execute(
        medicationIds: Medication['medicationId'][],
        auth: AuthData
    ): Promise<{ updated: number }>
}
