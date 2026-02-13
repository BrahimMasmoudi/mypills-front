import { onRequest } from 'firebase-functions/v2/https'
import { FirebaseStorageAdapter } from '../../adapters/document/firebase-storage-adapter'
import { FirestoreSharedLinkRepository } from '../../adapters/document/firestore-shared-link-repository'
import { ValidateSharedLink } from '../../../application/usecases/document/validate-shared-link'

export const validateSharedLink = onRequest({ region: 'europe-west3' }, async (req, res) => {
    // Only allow GET requests
    if (req.method !== 'GET') {
        res.status(405).send('Method Not Allowed')
        return
    }

    const token = req.query.token as string

    if (!token) {
        res.status(400).send('Missing token parameter')
        return
    }

    try {
        const storageAdapter = new FirebaseStorageAdapter()
        const sharedLinkRepository = new FirestoreSharedLinkRepository()
        const validateSharedLinkUseCase = new ValidateSharedLink(sharedLinkRepository, storageAdapter)

        const result = await validateSharedLinkUseCase.execute(token)

        if (!result.valid) {
            // Return error page or JSON
            res.status(403).json({ error: result.error })
            return
        }

        // Redirect to the temporary Storage URL
        res.redirect(302, result.url!)
    } catch (error: any) {
        console.error('Error validating shared link:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})
