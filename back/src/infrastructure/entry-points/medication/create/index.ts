import {HttpsError, onCall} from "firebase-functions/v2/https";
import {FirestoreMedicationRepositoryAdapter} from "../../../adapters/persistence/firestore-medication-repository-adapter";
import {CreateMedication} from "../../../../application/usecases/medication/create-medication/create-medication";
import {Medication} from "../../../../domain/entities/medication";
import {$firebaseConnector} from "../../../config/firebase";

export const createMedication = onCall({region: 'europe-west3'}, async ({data}) => {
    const medicationRepo = new FirestoreMedicationRepositoryAdapter($firebaseConnector)
    const createMedicationUseCase = new CreateMedication(medicationRepo)

    const medication = data.medication as Medication
    try {
        await createMedicationUseCase.execute(medication)
        return {success: true}
    } catch (error) {
        // Here you handle mapping domain errors to HttpsErrors
        throw new HttpsError('internal', 'Could not create medication')
    }
})
