import {Reminder} from '../../../domain/entities/reminder'
import {FirestoreConnector} from '../connectors/firestore-connector'
import {CollectionReference, Timestamp} from 'firebase-admin/firestore'
import {ReminderRepository} from '../../../domain/gateway/reminder/reminder-repository'

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

        const batch = this.connector.firestore.batch()

        reminders.forEach((reminder) => {
            const docRef = this.collection.doc(reminder.reminderId)

            batch.set(docRef, {
                sicknessName: reminder.sicknessName,
                userId: reminder.userId,
                medName: reminder.medName,
                quantity: reminder.quantity,
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

        const data = doc.data() as Reminder
        if (!data) return null

        return {
            sicknessName: data.sicknessName,
            reminderId: doc.id,
            userId: data.userId,
            medName: data.medName,
            quantity: data.quantity,
            scheduledTime: (data.scheduledTime as unknown as Timestamp).toDate(),
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
