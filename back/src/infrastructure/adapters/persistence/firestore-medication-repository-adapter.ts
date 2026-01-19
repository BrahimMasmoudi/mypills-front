import {MedicationRepository} from '../../../domain/repositories/medication-repository'
import {Medication} from '../../../domain/entities/medication'
import {FirestoreConnector} from '../connectors/firestore-connector'
import {FieldValue, CollectionReference} from 'firebase-admin/firestore'

export class FirestoreMedicationRepositoryAdapter implements MedicationRepository {
    private readonly collection: CollectionReference

    constructor(private readonly connector: FirestoreConnector) {
        this.collection = this.connector.collection('medications')
    }

    async create(medication: Medication): Promise<void> {
        await this.collection.doc(medication.medicationId).set(medication, {
            merge: false
        })
    }

    async increment(medication: Medication): Promise<void> {
        await this.collection.doc(medication.medicationId).update({
            quantity: FieldValue.increment(1)
        })
    }

    async decrement(medication: Medication): Promise<void> {
        await this.collection.doc(medication.medicationId).update({
            quantity: FieldValue.increment(-1)
        })
    }

    async delete(medication: Medication): Promise<void> {
        await this.collection.doc(medication.medicationId).delete()
    }

    async update<K extends keyof Medication>(
        medication: Medication,
        key: K,
        value: Medication[K]
    ): Promise<void> {
        await this.collection.doc(medication.medicationId).update({
            [key]: value
        })
    }

    // infrastructure/adapters/persistence/firestore-medication-repository-adapter.ts
    async setExpiredStatus(medicationIds: Medication['medicationId'][]): Promise<{updated: number}> {
        try {
            if (!medicationIds || medicationIds.length === 0) {
                return { updated: 0 };
            }

            const batchSize = 500;
            let totalUpdated = 0;

            for (let i = 0; i < medicationIds.length; i += batchSize) {
                // CRITICAL: Access via this.connector.firestore
                const batch = this.connector.firestore.batch();
                const batchIds = medicationIds.slice(i, i + batchSize);

                for (const id of batchIds) {
                    const docRef = this.collection.doc(id);
                    batch.update(docRef, { expired: true });
                }

                await batch.commit();
                totalUpdated += batchIds.length;
            }
            return { updated: totalUpdated };
        } catch (error) {
            console.error('Error updating expired status:', error);
            throw error;
        }
    }
}