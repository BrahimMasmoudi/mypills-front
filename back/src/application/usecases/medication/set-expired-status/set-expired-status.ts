import { MedicationRepository } from '../../../../domain/repositories/medication/medication-repository'
import { Medication } from '../../../../domain/entities/medication'
import { AuthData } from 'firebase-functions/v2/tasks'
import { SetExpiredStatusUseCase } from '../../../ports/input/medication/set-expired-status-use-case'

export class SetExpiredStatus implements SetExpiredStatusUseCase {
    constructor(private medicationRepo: MedicationRepository) {
    }

    async execute(
        medicationIds: Medication['medicationId'][],
        auth: AuthData
    ): Promise<{ updated: number }> {
        return await this.medicationRepo.setExpiredStatus(medicationIds, auth)
    }
}
