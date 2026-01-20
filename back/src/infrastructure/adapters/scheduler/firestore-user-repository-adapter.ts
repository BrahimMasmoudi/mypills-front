import { FirestoreConnector } from '../connectors/firestore-connector'
import { CollectionReference, Timestamp } from 'firebase-admin/firestore'
import { UserRepository } from '../../../domain/gateway/reminder/user-repository'

export class FirestoreUserRepositoryAdapter implements UserRepository {
    private readonly collection: CollectionReference

    constructor(private readonly connector: FirestoreConnector) {
        this.collection = this.connector.collection('users')
    }

    async saveFcmToken(userId: string, token: string): Promise<void> {
        await this.collection.doc(userId).set({
            fcmToken: token,
            userId: userId, // Ensure userId is present in the doc
            lastTokenUpdate: Timestamp.now(),
        }, { merge: true })
    }

    async getDeviceToken(userId: string): Promise<string | null> {
        const doc = await this.collection.doc(userId).get()

        if (!doc.exists) {
            return null
        }

        const data = doc.data()
        return data?.fcmToken || null
    }
}
