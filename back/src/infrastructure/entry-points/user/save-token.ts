import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { FirestoreUserRepositoryAdapter } from '../../adapters/user/firestore-user-repository-adapter'
import { SaveUserToken } from '../../../application/usecases/user/save-token'
import { $firebaseConnector } from '../../config/firebase'

export const saveUserToken = onCall({ region: 'europe-west3', enforceAppCheck: true }, async (request) => {
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
