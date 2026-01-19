import { MedicationRepository } from '../../../../domain/repositories/medication-repository'
import { Medication } from '../../../../domain/entities/medication'

export class UpdateMedication implements UpdateMedication {
    constructor(private medicationRepo: MedicationRepository) {
    }

    async execute<K extends keyof Medication>(
        medication: Medication,
        key: K,
        value: Medication[K]
    ): Promise<void> {
        return await this.medicationRepo.update(medication, key, value)
    }
}
