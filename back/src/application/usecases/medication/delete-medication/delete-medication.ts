import {MedicationRepository} from '../../../../domain/repositories/medication-repository'
import {Medication} from '../../../../domain/entities/medication'
import {DeleteMedicationUseCase} from "../../../ports/input/medication/delete-medication-use-case";

export class DeleteMedication implements DeleteMedicationUseCase {
    constructor(private medicationRepo: MedicationRepository) {
    }

    async execute(medication: Medication): Promise<void> {
        return await this.medicationRepo.delete(medication)
    }
}
