import { MedicationRepository } from '../../../../domain/repositories/medication-repository'
import { Medication } from '../../../../domain/entities/medication'

export class SetExpiredStatus implements SetExpiredStatus {
    constructor(private medicationRepo: MedicationRepository) {
    }

    async execute(
        medicationIds: Medication['medicationId'][],
    ): Promise<{ updated: number }> {
        return await this.medicationRepo.setExpiredStatus(medicationIds)
    }
}
