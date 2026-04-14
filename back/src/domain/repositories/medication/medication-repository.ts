import { Medication } from '../../entities/medication'
import { GetMedicationDetailsResponse } from '../../../types/medicationApi'
import { AuthData } from 'firebase-functions/v2/tasks'

export interface MedicationRepository {
    create(medication: Medication, auth: AuthData): Promise<void>
    get(medicationId: string, auth: AuthData): Promise<Medication | null>
    increment(medication: Medication, auth: AuthData, amount?: number): Promise<void>
    decrement(medication: Medication, auth: AuthData, amount?: number): Promise<void>
    delete(medication: Medication, auth: AuthData): Promise<void>

    update<K extends keyof Medication>(
        medication: Medication,
        auth: AuthData,
        key: K,
        value: Medication[K]
    ): Promise<void>

    setExpiredStatus(medicationIds: Medication['medicationId'][], auth: AuthData): Promise<{ updated: number }>
    list(auth: AuthData): Promise<Medication[]>
    fetchTunisianMedications(query: string): Promise<(GetMedicationDetailsResponse & { id: string })[]>
}
