import {Medication} from '../entities/medication'

export interface MedicationRepository {
    create(medication: Medication): Promise<void>
    increment(medication: Medication): Promise<void>
    decrement(medication: Medication): Promise<void>
    delete(medication: Medication): Promise<void>
}
