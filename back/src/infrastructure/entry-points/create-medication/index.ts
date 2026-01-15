import {HttpsError, onCall} from "firebase-functions/v2/https";
import {FirestoreConnector} from "../../adapters/connectors/firestoreConnector";
import {FirestoreMedicationRepositoryAdapter} from "../../adapters/persistence/FirestoreMedicationRepositoryAdapter";
import {CreateMedication} from "../../../application/usecases/CreateMedication";
import {Medication} from "../../../domain/entities/medication";
import {$firestore} from "../../config/firebase";

export const createMedication = onCall({region: 'europe-west3'}, async (request) => {
    const firebaseConnector = new FirestoreConnector($firestore)
    const medicationRepo = new FirestoreMedicationRepositoryAdapter(firebaseConnector)
    const createMedicationUseCase = new CreateMedication(medicationRepo)

    const medication = request.data.medication as Medication
    try {
        await createMedicationUseCase.execute(medication)
        return {success: true}
    } catch (error) {
        // Here you handle mapping domain errors to HttpsErrors
        throw new HttpsError('internal', 'Could not create medication')
    }
})
