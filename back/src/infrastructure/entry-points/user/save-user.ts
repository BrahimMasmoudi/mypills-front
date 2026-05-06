import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { SaveUser } from '../../../application/usecases/user/save-user'
import { FirestoreUserRepositoryAdapter } from '../../adapters/user/firestore-user-repository-adapter'
import { $firebaseConnector } from '../../config/firebase'

export const saveUser = onCall({ region: 'europe-west3', enforceAppCheck: true }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in.')
    }

    const uid = request.auth.uid
    const { name, email } = request.data

    if (!name || !email) {
        throw new HttpsError('invalid-argument', 'Name and email are required.')
    }

    const userRepository = new FirestoreUserRepositoryAdapter($firebaseConnector)
    const saveUserUseCase = new SaveUser(userRepository)

    try {
        await saveUserUseCase.execute(uid, name, email)
        return { success: true }
    } catch (error) {
        throw new HttpsError('internal', 'Failed to save user details')
    }
})
