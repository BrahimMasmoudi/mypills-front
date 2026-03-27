import { AdvisorGateway } from '../../../domain/gateway/advisor-gateway'
import { Medication } from '../../../domain/entities/medication'
import { FirebaseAiConnector } from '../connectors/firebase-ai-connector'
import { StructuredAdvice } from '../../../domain/entities/structured-advice'

export class FirebaseAIAdvisorAdapter implements AdvisorGateway {
    constructor(private readonly firebaseConnector: FirebaseAiConnector) { }

    async getAdvice(symptom: string, cabinet: Medication[], language: string): Promise<StructuredAdvice> {
        if (cabinet.length === 0) {
            return {
                explanation: language === 'fr'
                    ? "Vous n'avez pas de médicaments dans votre armoire. Veuillez consulter un médecin."
                    : "You don't have any medications in your cabinet. Please consult a doctor.",
                usableMedications: []
            }
        }

        const systemInstruction = `
            You are a Medication Advisor AI. 
            STRICT RULES:
            1. You are NOT a doctor. You must state this disclaimer clearly in your explanation and advise the user to consult a medical professional.
            2. You must explain your reasoning in the explanation field.
            3. ONLY suggest medications that are explicitly listed in the "User's Medication Cabinet" provided below. Do NOT suggest any external medications.
            4. Expired medications must NOT go into usableMedications; they should be warned about in the explanation.
            5. If no medication matches the symptom, state clearly in the explanation that nothing is appropriate and leave usableMedications empty.
            6. You must respond entirely in the following language code: ${language}. If language is 'fr', respond in French. If 'en', in English, etc.
            7. Your output MUST be a valid JSON object following this schema exactly:
            {
                "explanation": "string containing your advice and disclaimers in ${language}",
                "usableMedicationIds": ["exact medicationId 1", "exact medicationId 2"]
            }
        `

        const cabinetData = cabinet.map(m => ({
            medicationId: m.medicationId,
            name: m.name,
            ingredients: m.details?.ingredients?.map((i: any) => i.substance).join(', ') || 'N/A',
            expiryDate: m.expiryDate,
            expired: m.expired
        }))

        const prompt = `
            ${systemInstruction}

            User's Symptom/Sickness: "${symptom}"

            User's Medication Cabinet:
            ${JSON.stringify(cabinetData, null, 2)}
        `

        const model = this.firebaseConnector.getModel("gemini-1.5-flash", true)
        const result = await model.generateContent(prompt)
        const responseText = result.response.text()

        try {
            const parsed = JSON.parse(responseText)
            const explanation = parsed.explanation || "No explanation provided."
            const returnedIds: string[] = Array.isArray(parsed.usableMedicationIds) ? parsed.usableMedicationIds : []
            
            // Map the IDs returned by AI to actual Medication objects from the cabinet
            const usableMedications = cabinet.filter(med => 
                returnedIds.includes(med.medicationId)
            )

            return {
                explanation,
                usableMedications
            }
        } catch (e: any) {
            throw new Error('Failed to parse AI advice: ' + responseText)
        }
    }
}
