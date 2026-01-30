import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { Medication } from '../../../../types/medication'
import { FirestoreMedicationRepositoryAdapter } from '../../../adapters/persistence/firestore-medication-repository-adapter'
import { IncrementMedication } from '../../../../application/usecases/medication/increment-medication/increment-medication'
import { $firebaseConnector } from '../../../config/firebase'

export const incrementMedication = onCall({ region: 'europe-west3' }, async ({ data, auth }) => {
    if (!auth) {
        throw new HttpsError(
            'unauthenticated',
            'The function increment must be called while authenticated.'
        )
    }
    const medicationRepo = new FirestoreMedicationRepositoryAdapter($firebaseConnector)
    const incrementMedicationUseCase = new IncrementMedication(medicationRepo)

    const medication = data.medication as Medication
    try {
        await incrementMedicationUseCase.execute(medication, auth)
        return { success: true }
    } catch (error) {
        throw new HttpsError('internal', 'Could not increment medication')
    }
})
