import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { Medication } from '../../../../types/medication'
import { FirestoreMedicationRepositoryAdapter } from '../../../adapters/persistence/firestore-medication-repository-adapter'
import { $firebaseConnector } from '../../../config/firebase'
import { DecrementMedication } from '../../../../application/usecases/medication/decrement-medication/decrement-medication'

export const decrementMedication = onCall({ region: 'europe-west3' }, async ({ data }) => {
    const medicationRepo = new FirestoreMedicationRepositoryAdapter($firebaseConnector)
    const decrementMedicationUseCase = new DecrementMedication(medicationRepo)

    const medication = data.medication as Medication
    try {
        await decrementMedicationUseCase.execute(medication)
        return { success: true }
    } catch (error) {
        throw new HttpsError('internal', 'Could not decrement medication')
    }
})
