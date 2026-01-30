import { Medication } from '../../../../domain/entities/medication'
import { AuthData } from 'firebase-functions/v2/tasks'

export interface IncrementMedicationUseCase {
    execute(medication: Medication, auth: AuthData): Promise<void>
}
