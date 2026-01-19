import { Medication } from '../../../../domain/entities/medication'

export interface IncrementMedicationUseCase {
    execute(medication: Medication): Promise<void>
}
