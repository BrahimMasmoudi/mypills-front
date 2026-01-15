import {Medication} from '../../../domain/entities/medication'

export interface CreateMedicationUseCase {
    execute(medication: Medication): Promise<void>
}
