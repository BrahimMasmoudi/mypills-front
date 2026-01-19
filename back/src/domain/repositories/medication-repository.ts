import {Medication} from '../entities/medication'

export interface MedicationRepository {
    create(medication: Medication): Promise<void>

    increment(medication: Medication): Promise<void>

    decrement(medication: Medication): Promise<void>

    delete(medication: Medication): Promise<void>

    update<K extends keyof Medication>(
        medication: Medication,
        key: K,
        value: Medication[K]
    ): Promise<void>

    setExpiredStatus(medicationIds: Medication['medicationId'][]): Promise<{updated: number}>
}
