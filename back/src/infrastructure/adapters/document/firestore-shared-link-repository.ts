import { SharedLinkRepositoryPort } from '../../../domain/gateway/document/shared-link-repository-port'
import { SharedLink } from '../../../domain/entities/document/shared-link'
import { $firestore } from '../../config/firebase'
import { Firestore } from 'firebase-admin/firestore'

export class FirestoreSharedLinkRepository implements SharedLinkRepositoryPort {
    private firestore: Firestore
    private collection: string = 'sharedLinks'

    constructor() {
        this.firestore = $firestore
    }

    async save(sharedLink: SharedLink): Promise<void> {
        await this.firestore.collection(this.collection).doc(sharedLink.tokenId).set({
            storagePath: sharedLink.storagePath,
            userId: sharedLink.userId,
            expiresAt: sharedLink.expiresAt,
            createdAt: sharedLink.createdAt
        })
    }

    async findByToken(tokenId: string): Promise<SharedLink | null> {
        const doc = await this.firestore.collection(this.collection).doc(tokenId).get()

        if (!doc.exists) {
            return null
        }

        const data = doc.data()!
        return new SharedLink(
            tokenId,
            data.storagePath,
            data.userId,
            data.expiresAt.toDate(),
            data.createdAt.toDate()
        )
    }
}
