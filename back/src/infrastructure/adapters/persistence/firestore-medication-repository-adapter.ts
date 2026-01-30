import { MedicationRepository } from '../../../domain/repositories/medication/medication-repository'
import { Medication } from '../../../domain/entities/medication'
import { FirestoreConnector } from '../connectors/firestore-connector'
import { FieldValue, CollectionReference } from 'firebase-admin/firestore'
import { HttpsError } from 'firebase-functions/v2/https'
import { GetMedicationDetailsResponse } from '../../../types/medicationApi'
import { AuthData } from 'firebase-functions/v2/tasks'

export class FirestoreMedicationRepositoryAdapter implements MedicationRepository {
    private readonly collection: CollectionReference
    private readonly tunisianMedicationCollection: CollectionReference

    constructor(private readonly connector: FirestoreConnector) {
        this.collection = this.connector.collection('medications')
        this.tunisianMedicationCollection = this.connector.collection('tunisian_meds')
    }

    private async getSecureDocRef(medicationId: string, auth: AuthData) {
        const docRef = this.collection.doc(medicationId)
        const doc = await docRef.get()

        if (!doc.exists) {
            throw new HttpsError('not-found', 'Medication not found.')
        }

        if (doc.data()?.uid !== auth.uid) {
            throw new HttpsError('permission-denied', 'You do not own this medication.')
        }

        return docRef
    }

    async create(medication: Medication, auth: AuthData): Promise<void> {
        await this.collection.doc(medication.medicationId).set({
            ...medication,
            uid: auth.uid,
        }, { merge: false })
    }

    async increment(medication: Medication, auth: AuthData): Promise<void> {
        const docRef = await this.getSecureDocRef(medication.medicationId, auth)
        await docRef.update({
            quantity: FieldValue.increment(1),
        })
    }

    async decrement(medication: Medication, auth: AuthData): Promise<void> {
        const docRef = await this.getSecureDocRef(medication.medicationId, auth)
        await docRef.update({
            quantity: FieldValue.increment(-1),
        })
    }

    async delete(medication: Medication, auth: AuthData): Promise<void> {
        const docRef = await this.getSecureDocRef(medication.medicationId, auth)
        await docRef.delete()
    }

    async update<K extends keyof Medication>(
        medication: Medication,
        auth: AuthData,
        key: K,
        value: Medication[K]
    ): Promise<void> {
        const docRef = await this.getSecureDocRef(medication.medicationId, auth)
        await docRef.update({
            [key]: value,
        })
    }

    async setExpiredStatus(medicationIds: Medication['medicationId'][], auth : AuthData): Promise<{ updated: number }> {
        try {
            if (!medicationIds || medicationIds.length === 0) {
                return { updated: 0 }
            }

            const batchSize = 500
            let totalUpdated = 0

            for (let i = 0; i < medicationIds.length; i += batchSize) {
                const batch = this.connector.firestore.batch()
                const batchIds = medicationIds.slice(i, i + batchSize)

                const snapshot = await this.collection
                    .where('uid', '==', auth.uid)
                    .where('medicationId', 'in', batchIds)
                    .get()

                if (snapshot.empty) continue

                snapshot.docs.forEach((doc) => {
                    batch.update(doc.ref, { expired: true })
                })

                await batch.commit()
                totalUpdated += snapshot.size
            }
            return { updated: totalUpdated }
        } catch (error) {
            console.error('Error updating expired status:', error)
            throw new HttpsError('internal', 'Batch update failed')
        }
    }

    async fetchTunisianMedications(query: string): Promise<(GetMedicationDetailsResponse & { id: string })[]> {
        const snapshot = await this.tunisianMedicationCollection
            .where('name', '>=', query)
            .where('name', '<=', query + '\uf8ff')
            .limit(30)
            .get()

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as GetMedicationDetailsResponse),
        }))
    }
}
