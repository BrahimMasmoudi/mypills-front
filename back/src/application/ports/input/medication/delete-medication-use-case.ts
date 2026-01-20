import { Medication } from '../../../../domain/entities/medication'

export interface DeleteMedicationUseCase {
    execute(medication: Medication): Promise<void>
}
