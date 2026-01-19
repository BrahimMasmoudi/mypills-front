import { Medication } from '../../../../domain/entities/medication'

export interface SetExpiredStatusUseCase {
    execute(
        medicationIds: Medication['medicationId'][],
    ): Promise<{ updated: number }>
}
