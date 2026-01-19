import {MedicationRepository} from '../../../../domain/repositories/medication-repository'
import {Medication} from '../../../../domain/entities/medication'

export class DeleteMedication implements DeleteMedication {
    constructor(private medicationRepo: MedicationRepository) {
    }

    async execute(medication: Medication): Promise<void> {
        return await this.medicationRepo.delete(medication)
    }
}
