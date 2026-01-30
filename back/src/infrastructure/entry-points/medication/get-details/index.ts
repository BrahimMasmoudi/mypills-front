import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { FirestoreCisLookupAdapter } from '../../../adapters/persistence/firestore-cis-lookup-adapter'
import { $firebaseConnector } from '../../../config/firebase'
import { GiygasApiAdapter } from '../../../adapters/external/giygas-api-adapter'
import { GetMedicationDetails } from '../../../../application/usecases/medication/get-details/get-medication-details'
import {Cip13} from "../../../../types/cip13";

export const getMedicationDetails = onCall({ region: 'europe-west3' }, async ({ data, auth }) => {
    if (!auth) {
        throw new HttpsError(
            'unauthenticated',
            'The function getMedicationDetails must be called while authenticated.'
        )
    }
    const cisRepo = new FirestoreCisLookupAdapter($firebaseConnector)
    const apiGateway = new GiygasApiAdapter()
    const useCase = new GetMedicationDetails(cisRepo, apiGateway)

    try {
        return await useCase.execute(Cip13.create(data.cip13))
    } catch (e: any) {
        if (e.message === 'NOT_FOUND_IN_DB') {
            throw new HttpsError('not-found', 'Medication not found in database')
        }
        throw new HttpsError('internal', `Search failed ${e.message}`)
    }
})
