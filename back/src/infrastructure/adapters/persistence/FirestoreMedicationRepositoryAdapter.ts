import {MedicationRepository} from '../../../domain/repositories/MedicationRepository'
import {Medication} from '../../../domain/entities/medication'
import {FirestoreConnector} from "../connectors/firestoreConnector";

export class FirestoreMedicationRepositoryAdapter implements MedicationRepository {
    constructor(private readonly connector: FirestoreConnector) {
    }

    async create(medication: Medication): Promise<void> {
        // Get the reference using the connector's method
        const col = this.connector.collection('medications')

        await col.doc(medication.medicationId).set(medication, {
            merge: false
        })
    }
}