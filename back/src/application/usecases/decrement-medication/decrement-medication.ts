import {MedicationRepository} from '../../../domain/repositories/medication-repository'
import {Medication} from '../../../domain/entities/medication'
import {DecrementMedicationUseCase} from "../../ports/input/medication/decrement-medication-use-case";

export class DecrementMedication implements DecrementMedicationUseCase {
    constructor(private medicationRepo: MedicationRepository) {
    }

    async execute(medication: Medication): Promise<void> {
        return await this.medicationRepo.decrement(medication)
    }
}
