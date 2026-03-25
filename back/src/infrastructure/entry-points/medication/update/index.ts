import { HttpsError, onCall } from 'firebase-functions/v2/https'
import {
    FirestoreMedicationRepositoryAdapter,
} from '../../../adapters/persistence/firestore-medication-repository-adapter'
import { Medication } from '../../../../domain/entities/medication'
import { $firebaseConnector } from '../../../config/firebase'
import { UpdateMedication } from '../../../../application/usecases/medication/update-medication/update-medication'

export const updateMedication = onCall({ region: 'europe-west3', enforceAppCheck: process.env.FUNCTIONS_EMULATOR !== 'true' }, async ({ data, auth }) => {
    if (!auth) {
        throw new HttpsError(
            'unauthenticated',
            'The function update medication must be called while authenticated.'
        )
    }
    const medicationRepo = new FirestoreMedicationRepositoryAdapter($firebaseConnector)
    const updateMedicationUseCase = new UpdateMedication(medicationRepo)

    const medication = data.medication as Medication
    const key = data.key as keyof Medication
    const value = data.value as Medication[typeof key]
    try {
        await updateMedicationUseCase.execute(medication, key, value, auth)
        return { success: true }
    } catch (error) {
        // Here you handle mapping domain errors to HttpsErrors
        throw new HttpsError('internal', 'Could not update medication')
    }
})
