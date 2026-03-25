import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { SaveUserToken } from '../../../../application/usecases/scheduler/user-token/save-token'
import { FirestoreUserRepositoryAdapter } from '../../../adapters/scheduler/firestore-user-repository-adapter'
import { $firebaseConnector } from '../../../config/firebase'

export const saveUserToken = onCall({ region: 'europe-west3', enforceAppCheck: process.env.FUNCTIONS_EMULATOR !== 'true' }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in.')
    }

    const uid = request.auth.uid
    const fcmToken = request.data.fcmToken

    const userRepository = new FirestoreUserRepositoryAdapter($firebaseConnector)

    const saveTokenUseCase = new SaveUserToken(userRepository)

    try {
        await saveTokenUseCase.execute(uid, fcmToken)
        return { success: true }
    } catch (error) {
        throw new HttpsError('internal', 'Failed to save token')
    }
})
