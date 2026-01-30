import { Medication } from '../../entities/medication'
import { GetMedicationDetailsResponse } from '../../../types/medicationApi'
import { AuthData } from 'firebase-functions/v2/tasks'

export interface MedicationRepository {
    create(medication: Medication, auth: AuthData): Promise<void>
    increment(medication: Medication, auth: AuthData): Promise<void>
    decrement(medication: Medication, auth: AuthData): Promise<void>
    delete(medication: Medication, auth: AuthData): Promise<void>

    update<K extends keyof Medication>(
        medication: Medication,
        auth: AuthData,
        key: K,
        value: Medication[K]
    ): Promise<void>

    setExpiredStatus(medicationIds: Medication['medicationId'][], auth : AuthData): Promise<{ updated: number }>

    fetchTunisianMedications(query: string): Promise<(GetMedicationDetailsResponse & { id: string })[]>
}
