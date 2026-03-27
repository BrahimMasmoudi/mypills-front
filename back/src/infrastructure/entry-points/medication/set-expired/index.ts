import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { FirestoreMedicationRepositoryAdapter } from '../../../adapters/persistence/firestore-medication-repository-adapter'
import { $firebaseConnector } from '../../../config/firebase'
import { SetExpiredStatus } from '../../../../application/usecases/medication/set-expired-status/set-expired-status'

export const setExpiredStatus = onCall({ region: 'europe-west3', enforceAppCheck: true }, async ({ data, auth }) => {
    if (!auth) {
        throw new HttpsError(
            'unauthenticated',
            'The function set expired status must be called while authenticated.'
        )
    }
    const medicationRepo = new FirestoreMedicationRepositoryAdapter($firebaseConnector)
    const setMedicationExpiredStatusUseCase = new SetExpiredStatus(medicationRepo)

    const medicationIds = data.medicationIds as string[]

    if (!medicationIds || medicationIds.length === 0) {
        return { updated: 0 }
    }

    try {
        return await setMedicationExpiredStatusUseCase.execute(medicationIds, auth)
    } catch (error) {
        // Here you handle mapping domain errors to HttpsErrors
        throw new HttpsError('internal', 'Could not set medication status expired')
    }
})
