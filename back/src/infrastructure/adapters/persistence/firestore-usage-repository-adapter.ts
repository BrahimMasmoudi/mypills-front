import { UsageGateway } from '../../../domain/gateway/usage-gateway'
import { FirestoreConnector } from '../connectors/firestore-connector'
import { HttpsError } from 'firebase-functions/v2/https'

export class FirestoreUsageRepositoryAdapter implements UsageGateway {
    private readonly collectionName = 'ai_usage'

    constructor(private readonly connector: FirestoreConnector) {}

    async checkAndIncrementUsage(uid: string, limit: number): Promise<void> {
        const today = new Date().toISOString().split('T')[0]
        const docRef = this.connector.collection(this.collectionName).doc(uid)

        await this.connector.firestore.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef)

            if (!doc.exists) {
                transaction.set(docRef, {
                    currentCount: 1,
                    lastResetDate: today
                })
                return
            }

            const data = doc.data()
            if (data?.lastResetDate === today) {
                if (data.currentCount >= limit) {
                    throw new HttpsError('resource-exhausted', 'Daily AI usage quota exceeded.')
                }
                transaction.update(docRef, {
                    currentCount: data.currentCount + 1
                })
            } else {
                // New day, reset the count
                transaction.update(docRef, {
                    currentCount: 1,
                    lastResetDate: today
                })
            }
        })
    }
}
