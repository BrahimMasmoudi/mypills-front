import { MedicationRepository } from '../../../../domain/repositories/medication/medication-repository'
import { Medication } from '../../../../domain/entities/medication'
import { DecrementMedicationUseCase } from '../../../ports/input/medication/decrement-medication-use-case'
import { AuthData } from 'firebase-functions/v2/tasks'

export class DecrementMedication implements DecrementMedicationUseCase {
    constructor(private medicationRepo: MedicationRepository) {
    }

    async execute(medication: Medication, auth : AuthData): Promise<void> {
        return await this.medicationRepo.decrement(medication, auth)
    }
}
