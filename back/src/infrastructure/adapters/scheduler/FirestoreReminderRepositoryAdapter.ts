import { Reminder } from '../../../domain/entities/reminder'
import { FirestoreConnector } from '../connectors/firestore-connector'
import { CollectionReference, Timestamp } from 'firebase-admin/firestore'
import { ReminderRepository } from '../../../domain/gateway/reminder/reminder-repository'

export class FirestoreReminderRepositoryAdapter implements ReminderRepository {
    private readonly collection: CollectionReference

    constructor(private readonly connector: FirestoreConnector) {
        this.collection = this.connector.collection('reminders')
    }

    nextId(): string {
        return this.collection.doc().id
    }

    async saveBatch(reminders: Reminder[]): Promise<void> {
        if (reminders.length === 0) return

        // Firestore batches can handle up to 500 ops.
        // For simplicity, we assume <500 here, or you can use a chunking utility.
        const batch = this.connector.firestore.batch()

        reminders.forEach((reminder) => {
            const docRef = this.collection.doc(reminder.reminderId)

            // Map Domain Entity -> Firestore Document
            batch.set(docRef, {
                userId: reminder.userId,
                medName: reminder.medName,
                quantity: reminder.quantity,
                // Convert JS Date to Firestore Timestamp
                scheduledTime: Timestamp.fromDate(reminder.scheduledTime),
                status: reminder.status,
                createdAt: Timestamp.now(),
            })
        })

        await batch.commit()
    }

    async getById(id: string): Promise<Reminder | null> {
        const doc = await this.collection.doc(id).get()

        if (!doc.exists) {
            return null
        }

        const data = doc.data()
        if (!data) return null

        return {
            reminderId: doc.id,
            userId: data.userId,
            medName: data.medName,
            quantity: data.quantity,
            scheduledTime: (data.scheduledTime as Timestamp).toDate(),
            status: data.status,
        }
    }

    async updateStatus(id: string, status: 'pending' | 'sent' | 'failed'): Promise<void> {
        await this.collection.doc(id).update({
            status: status,
            updatedAt: Timestamp.now(),
        })
    }
}
