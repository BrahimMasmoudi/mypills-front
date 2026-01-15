import {MedicationRepository} from '../../domain/repositories/MedicationRepository'
import {CreateMedicationUseCase} from '../ports/input/CreateMedicationUseCase'
import {Medication} from '../../domain/entities/medication'

export class CreateMedication implements CreateMedicationUseCase {
    constructor(private medicationRepo: MedicationRepository) {
    }

    async execute(medication: Medication): Promise<void> {
        return await this.medicationRepo.create(medication)
    }
}
