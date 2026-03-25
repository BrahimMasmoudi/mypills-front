import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { FirestoreMedicationRepositoryAdapter } from '../../../adapters/persistence/firestore-medication-repository-adapter'
import { $firebaseConnector } from '../../../config/firebase'
import { DecrementMedication } from '../../../../application/usecases/medication/decrement-medication/decrement-medication'
import { Medication } from '../../../../domain/entities/medication'

export const decrementMedication = onCall({ region: 'europe-west3', enforceAppCheck: process.env.FUNCTIONS_EMULATOR !== 'true' }, async ({ data, auth }) => {
    if (!auth) {
        throw new HttpsError(
            'unauthenticated',
            'The function decrement medication increment must be called while authenticated.'
        )
    }
    const medicationRepo = new FirestoreMedicationRepositoryAdapter($firebaseConnector)
    const decrementMedicationUseCase = new DecrementMedication(medicationRepo)

    const medication = data.medication as Medication
    const amount = data.amount as number || 1
    try {
        await decrementMedicationUseCase.execute(medication, auth, amount)
        return { success: true }
    } catch (error) {
        throw new HttpsError('internal', 'Could not decrement medication')
    }
})
