import { MedicationRepository } from '../../../domain/repositories/medication/medication-repository'
import { Medication } from '../../../domain/entities/medication'
import { FirestoreConnector } from '../connectors/firestore-connector'
import { FieldValue, CollectionReference } from 'firebase-admin/firestore'
import { HttpsError } from 'firebase-functions/v2/https'
import { GetMedicationDetailsResponse } from '../../../types/medicationApi'

export class FirestoreMedicationRepositoryAdapter implements MedicationRepository {
    private readonly collection: CollectionReference
    private readonly tunisianMedicationCollection: CollectionReference

    constructor(private readonly connector: FirestoreConnector) {
        this.collection = this.connector.collection('medications')
        this.tunisianMedicationCollection = this.connector.collection('tunisian_meds')
    }

    async create(medication: Medication): Promise<void> {
        await this.collection.doc(medication.medicationId).set(medication, {
            merge: false,
        })
    }

    async increment(medication: Medication): Promise<void> {
        await this.collection.doc(medication.medicationId).update({
            quantity: FieldValue.increment(1),
        })
    }

    async decrement(medication: Medication): Promise<void> {
        await this.collection.doc(medication.medicationId).update({
            quantity: FieldValue.increment(-1),
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
            [key]: value,
        })
    }

    // infrastructure/adapters/persistence/firestore-medication-repository-adapter.ts
    async setExpiredStatus(medicationIds: Medication['medicationId'][]): Promise<{ updated: number }> {
        try {
            if (!medicationIds || medicationIds.length === 0) {
                return { updated: 0 }
            }

            const batchSize = 500
            let totalUpdated = 0

            for (let i = 0; i < medicationIds.length; i += batchSize) {
                // CRITICAL: Access via this.connector.firestore
                const batch = this.connector.firestore.batch()
                const batchIds = medicationIds.slice(i, i + batchSize)

                for (const id of batchIds) {
                    const docRef = this.collection.doc(id)
                    batch.update(docRef, { expired: true })
                }

                await batch.commit()
                totalUpdated += batchIds.length
            }
            return { updated: totalUpdated }
        } catch (error) {
            console.error('Error updating expired status:', error)
            throw error
        }
    }

    async fetchTunisianMedications(query: string): Promise<(GetMedicationDetailsResponse & { id: string })[]> {
        try {
            const snapshot = await this.tunisianMedicationCollection
                .where('name', '>=', query)
                .where('name', '<=', query + '\uf8ff')
                .limit(30)
                .get()

            return snapshot.docs.map((doc) => {
                const data = doc.data() as GetMedicationDetailsResponse
                return {
                    id: doc.id,
                    ...data,
                }
            })
        } catch (error) {
            console.error('Search error:', error)
            throw new HttpsError('internal', 'Search failed')
        }
    }
}
