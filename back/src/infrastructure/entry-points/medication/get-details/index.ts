import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { FirestoreCisLookupAdapter } from '../../../adapters/persistence/firestore-cis-lookup-adapter'
import { $firebaseConnector } from '../../../config/firebase'
import { GiygasApiAdapter } from '../../../adapters/external/giygas-api-adapter'
import { ExternalApiError } from '../../../adapters/external/external-api-error'
import { GetMedicationDetails } from '../../../../application/usecases/medication/get-details/get-medication-details'
import { Cip13 } from '../../../../types/cip13'

export const getMedicationDetails = onCall({ region: 'europe-west3', enforceAppCheck: true }, async ({ data, auth }) => {
    if (!auth) {
        throw new HttpsError(
            'unauthenticated',
            'The function getMedicationDetails must be called while authenticated.'
        )
    }

    const rawCip13 = typeof data?.cip13 === 'string' ? data.cip13.trim() : data?.cip13
    if (!Cip13.isValid(rawCip13)) {
        throw new HttpsError('invalid-argument', 'Valid cip13 is required')
    }

    const cip13 = Cip13.create(rawCip13)
    const cisRepo = new FirestoreCisLookupAdapter($firebaseConnector)
    const apiGateway = new GiygasApiAdapter()
    const useCase = new GetMedicationDetails(cisRepo, apiGateway)

    try {
        return await useCase.execute(cip13)
    } catch (e: unknown) {
        if (e instanceof Error && e.message === 'NOT_FOUND_IN_DB') {
            throw new HttpsError('not-found', 'Medication not found in database')
        }
        if (e instanceof ExternalApiError) {
            if (e.errorKind === 'TIMEOUT') {
                throw new HttpsError('deadline-exceeded', 'External medication service timed out')
            }
            throw new HttpsError('unavailable', 'External medication service unavailable')
        }

        logger.error('Unexpected error in getMedicationDetails', {
            error: e instanceof Error ? e.message : String(e),
        })
        throw new HttpsError('internal', 'Search failed')
    }
})
