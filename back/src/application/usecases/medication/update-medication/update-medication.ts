import { MedicationRepository } from '../../../../domain/repositories/medication/medication-repository'
import { Medication } from '../../../../domain/entities/medication'
import { AuthData } from 'firebase-functions/v2/tasks'

export class UpdateMedication implements UpdateMedication {
    constructor(private medicationRepo: MedicationRepository) {
    }

    async execute<K extends keyof Medication>(
        medication: Medication,
        key: K,
        value: Medication[K],
        auth: AuthData
    ): Promise<void> {
        return await this.medicationRepo.update(medication, auth, key, value)
    }
}
