import { MedicationRepository } from '../../../../domain/repositories/medication/medication-repository'
import { Medication } from '../../../../domain/entities/medication'
import { IncrementMedicationUseCase } from '../../../ports/input/medication/increment-medication-use-case'

export class IncrementMedication implements IncrementMedicationUseCase {
    constructor(private medicationRepo: MedicationRepository) {
    }

    async execute(medication: Medication): Promise<void> {
        return await this.medicationRepo.increment(medication)
    }
}
