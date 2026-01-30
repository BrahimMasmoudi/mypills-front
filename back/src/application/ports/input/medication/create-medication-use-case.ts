import { Medication } from '../../../../domain/entities/medication'
import { AuthData } from 'firebase-functions/v2/tasks'

export interface CreateMedicationUseCase {
    execute(medication: Medication, auth : AuthData): Promise<void>
}
