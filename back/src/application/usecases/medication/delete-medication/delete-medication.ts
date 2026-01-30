import { MedicationRepository } from '../../../../domain/repositories/medication/medication-repository'
import { Medication } from '../../../../domain/entities/medication'
import { DeleteMedicationUseCase } from '../../../ports/input/medication/delete-medication-use-case'
import { AuthData } from 'firebase-functions/v2/tasks'

export class DeleteMedication implements DeleteMedicationUseCase {
    constructor(private medicationRepo: MedicationRepository) {
    }

    async execute(medication: Medication, auth : AuthData): Promise<void> {
        return await this.medicationRepo.delete(medication, auth)
    }
}
