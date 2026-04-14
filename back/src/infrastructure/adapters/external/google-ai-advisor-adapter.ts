import { AdvisorGateway } from '../../../domain/gateway/advisor-gateway'
import { Medication } from '../../../domain/entities/medication'
import { GoogleAiConnector } from '../connectors/google-ai-connector'
import { StructuredAdvice } from '../../../domain/entities/structured-advice'

export class GoogleAIAdvisorAdapter implements AdvisorGateway {

    // Updated constructor type to the new GoogleAiConnector
    constructor(private readonly aiConnector: GoogleAiConnector) { }

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
    1. NO DISCLAIMERS: The application UI already displays a strict medical disclaimer. Do NOT include any general medical disclaimers (e.g., "I am not a doctor", "Please consult a professional"). Go straight to the analysis.
    2. Explain your reasoning ONLY for the medications you are recommending.
    3. ONLY suggest medications explicitly listed in the "User's Medication Cabinet". Do NOT suggest external medications.
    4. Ignore irrelevant medications. Do NOT mention or list medications from the cabinet that do not treat the user's current symptom.
    5. EXPIRED MEDS: Expired medications must NOT be included in "usableMedicationIds". If a matching medication is expired, warn the user about it in the explanation instead.
    6. MUTUAL EXCLUSIVITY: If multiple valid medications are suggested, you MUST explicitly state in the explanation that the user should choose ONLY ONE to take (e.g., "Take X OR Y, do not take both concurrently").
    7. EMPTY STATE: If no medication matches the symptom, state clearly that nothing in the cabinet is appropriate and leave "usableMedicationIds" empty.
    8. LANGUAGE: You must respond entirely in the following language code: ${language}.
    9. NO TECHNICAL DATA IN EXPLANATION:
        - Do NOT display medication IDs, internal identifiers, or technical data in the explanation.
        - The explanation must ONLY contain human-readable medication names and clear instructions.
        - IDs must ONLY appear inside "usableMedicationIds".
   10. DEDUPLICATION:
        - If multiple medicationIds correspond to the same medication (same name and dosage), treat them as ONE medication in the explanation.
        - Never repeat the same medication multiple times in the explanation.
        - However, keep all corresponding IDs in "usableMedicationIds".
    11. NATURAL LANGUAGE:
        - The explanation must sound natural and user-friendly.
        - Do NOT mention "cabinet", "list", or system concepts.
        - Speak as if directly advising the user.
    Your output MUST be a valid JSON object following this schema exactly:
    {
        "explanation": "string containing your direct advice and reasoning in ${language}. Must enforce taking only ONE medication if multiple are suggested. No disclaimers.",
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

        // Updated to gemini-2.5-flash for the best cost/performance ratio
        const model = this.aiConnector.getModel("gemini-2.5-flash", true)
        const result = await model.generateContent(prompt)

        // This still works perfectly thanks to our connector wrapper!
        const responseText = result.response.text()

        try {
            const parsed = JSON.parse(responseText)
            const explanation = parsed.explanation || "No explanation provided."
            const returnedIds: string[] = Array.isArray(parsed.usableMedicationIds) ? parsed.usableMedicationIds : []

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