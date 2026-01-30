import { HttpsError, onCall } from 'firebase-functions/v2/https'
import {
    FirestoreMedicationRepositoryAdapter,
} from '../../../adapters/persistence/firestore-medication-repository-adapter'
import { $firebaseConnector } from '../../../config/firebase'
import {
    FetchTunisianMedication,
} from '../../../../application/usecases/medication/fetch-tunisian-medication/fetch-tunisian-medication'

export const searchTunisianMeds = onCall({ region: 'europe-west3' }, async ({ data, auth }) => {
    if (!auth) {
        throw new HttpsError(
            'unauthenticated',
            'The function searchTunisianMeds must be called while authenticated.'
        )
    }
    const searchText = data.query || ''

    if (!searchText || searchText.length < 2) {
        return []
    }

    const searchTerm = searchText.toUpperCase() as string

    const medicationRepo = new FirestoreMedicationRepositoryAdapter($firebaseConnector)
    const fetchTunisianMedication = new FetchTunisianMedication(medicationRepo)

    try {
        return await fetchTunisianMedication.execute(searchTerm)
    } catch (error) {
        throw new HttpsError('internal', 'fetch tunisian-medication failed', error)
    }
})
