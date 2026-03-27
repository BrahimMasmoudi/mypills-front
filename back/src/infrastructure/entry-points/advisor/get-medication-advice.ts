import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { FirestoreMedicationRepositoryAdapter } from '../../adapters/persistence/firestore-medication-repository-adapter'
import { GoogleAIAdvisorAdapter } from '../../adapters/external/google-ai-advisor-adapter'
import { GetMedicationAdvice } from '../../../application/usecases/advisor/get-medication-advice'
import { $firebaseConnector, $aiConnector } from '../../config/firebase'

export const getMedicationAdvice = onCall(
    {
        region: 'europe-west3',
        enforceAppCheck: true
    },
    async ({ data, auth }) => {
        if (!auth) {
            throw new HttpsError(
                'unauthenticated',
                'The function must be called while authenticated.'
            )
        }

        const symptom = data.symptom
        const language = data.language || 'en'

        if (!symptom || typeof symptom !== 'string') {
            throw new HttpsError('invalid-argument', 'Symptom is required.')
        }

        const medicationRepo = new FirestoreMedicationRepositoryAdapter($firebaseConnector)
        const advisorGateway = new GoogleAIAdvisorAdapter($aiConnector)

        const getMedicationAdviceUseCase = new GetMedicationAdvice(medicationRepo, advisorGateway)

        try {
            const reply = await getMedicationAdviceUseCase.execute(symptom, language, auth)
            return { reply }
        } catch (error: any) {
            console.error('Advisor Error:', error)
            throw new HttpsError('internal', error.message || 'Failed to generate AI advice.')
        }
    }
)