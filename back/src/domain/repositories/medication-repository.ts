import {Medication} from '../entities/medication'

export interface MedicationRepository {
    create(medication: Medication): Promise<void>
    increment(medication: Medication): Promise<void>
}
