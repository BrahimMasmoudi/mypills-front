import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { FirebaseStorageAdapter } from '../../adapters/document/firebase-storage-adapter'
import { CreateSharedLink } from '../../../application/usecases/document/create-shared-link'

export const generateSharedLink = onCall({ region: 'europe-west3' }, async ({ data, auth }) => {
    // 1. Verify Authentication
    if (!auth) {
        throw new HttpsError('unauthenticated', 'User must be logged in.')
    }

    const { storagePath } = data

    if (!storagePath) {
        throw new HttpsError('invalid-argument', 'Storage path is required.')
    }

    try {
        const storageAdapter = new FirebaseStorageAdapter()
        const createSharedLinkUseCase = new CreateSharedLink(storageAdapter)

        const result = await createSharedLinkUseCase.execute(auth.uid, storagePath)
        return result
    } catch (error: any) {
        console.error('Error generating signed URL:', error)
        if (error.message === 'Document not found.') {
            throw new HttpsError('not-found', error.message)
        }
        if (error.message.includes('Permission denied')) {
            throw new HttpsError('permission-denied', error.message)
        }
        throw new HttpsError('internal', 'Unable to generate link.')
    }
})
