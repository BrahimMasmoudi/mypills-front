import { MedicationRepository } from '../../../../domain/repositories/medication/medication-repository'
import { CreateMedicationUseCase } from '../../../ports/input/medication/create-medication-use-case'
import { Medication } from '../../../../domain/entities/medication'
import { AuthData } from 'firebase-functions/v2/tasks'

export class CreateMedication implements CreateMedicationUseCase {
    constructor(private medicationRepo: MedicationRepository) {
    }

    async execute(medication: Medication, auth : AuthData): Promise<void> {
        return await this.medicationRepo.create(medication, auth)
    }
}
