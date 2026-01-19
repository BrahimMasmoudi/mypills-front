import {Medication} from '../../../../domain/entities/medication'

export interface DecrementMedicationUseCase {
    execute(medication: Medication): Promise<void>
}
