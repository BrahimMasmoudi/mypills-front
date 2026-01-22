import { MedicationRepository } from '../../../../domain/repositories/medication/medication-repository'
import { CreateMedicationUseCase } from '../../../ports/input/medication/create-medication-use-case'
import { Medication } from '../../../../domain/entities/medication'

export class CreateMedication implements CreateMedicationUseCase {
    constructor(private medicationRepo: MedicationRepository) {
    }

    async execute(medication: Medication): Promise<void> {
        return await this.medicationRepo.create(medication)
    }
}
