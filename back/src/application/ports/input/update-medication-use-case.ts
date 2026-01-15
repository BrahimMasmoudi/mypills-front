import {Medication} from '../../../domain/entities/medication'

export interface UpdateMedicationUseCase {
    execute<K extends keyof Medication>(
        medication: Medication,
        key: K,
        value: Medication[K]
    ): Promise<void>
}
