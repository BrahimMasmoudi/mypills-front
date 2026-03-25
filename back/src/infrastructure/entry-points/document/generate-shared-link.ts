import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { FirebaseStorageAdapter } from '../../adapters/document/firebase-storage-adapter'
import { FirestoreSharedLinkRepository } from '../../adapters/document/firestore-shared-link-repository'
import { CreateSharedLink } from '../../../application/usecases/document/create-shared-link'

export const generateSharedLink = onCall({ region: 'europe-west3', enforceAppCheck: true}, async ({ data, auth }) => {
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
        const sharedLinkRepository = new FirestoreSharedLinkRepository()
        const createSharedLinkUseCase = new CreateSharedLink(storageAdapter, sharedLinkRepository)

        const result = await createSharedLinkUseCase.execute(auth.uid, storagePath)
        return result
    } catch (error: any) {
        console.error('Error generating signed URL:', error)
        console.error('Error stack:', error.stack)
        console.error('Error details:', JSON.stringify(error, null, 2))

        if (error.message === 'Document not found.') {
            throw new HttpsError('not-found', error.message)
        }
        if (error.message.includes('Permission denied')) {
            throw new HttpsError('permission-denied', error.message)
        }

        // Include actual error message for debugging
        throw new HttpsError('internal', `Unable to generate link: ${error.message}`)
    }
})
