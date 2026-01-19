import {HttpsError, onCall} from "firebase-functions/v2/https";
import {FirestoreMedicationRepositoryAdapter} from "../../../adapters/persistence/firestore-medication-repository-adapter";
import {Medication} from "../../../../domain/entities/medication";
import {$firebaseConnector} from "../../../config/firebase";
import {DeleteMedication} from "../../../../application/usecases/delete-medication/delete-medication";

export const deleteMedication = onCall({region: 'europe-west3'}, async ({data}) => {
    const medicationRepo = new FirestoreMedicationRepositoryAdapter($firebaseConnector)
    const deleteMedicationUseCase = new DeleteMedication(medicationRepo)

    const medication = data.medication as Medication
    try {
        await deleteMedicationUseCase.execute(medication)
        return {success: true}
    } catch (error) {
        // Here you handle mapping domain errors to HttpsErrors
        throw new HttpsError('internal', 'Could not delete medication')
    }
})
