import {MedicationRepository} from '../../../domain/repositories/medication-repository'
import {Medication} from '../../../domain/entities/medication'
import {FirestoreConnector} from '../connectors/firestore-connector'
import {FieldValue, CollectionReference} from 'firebase-admin/firestore'

export class FirestoreMedicationRepositoryAdapter implements MedicationRepository {
    private readonly collection: CollectionReference

    constructor(private readonly connector: FirestoreConnector) {
        this.collection = this.connector.collection('medications')
    }

    async increment(medication: Medication): Promise<void> {
        await this.collection.doc(medication.medicationId).update({
            quantity: FieldValue.increment(1)
        })
    }

    async create(medication: Medication): Promise<void> {
        await this.collection.doc(medication.medicationId).set(medication, {
            merge: false
        })
    }
}