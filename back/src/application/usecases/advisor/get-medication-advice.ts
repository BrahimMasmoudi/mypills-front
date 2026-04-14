import { MedicationRepository } from '../../../domain/repositories/medication/medication-repository'
import { AdvisorGateway } from '../../../domain/gateway/advisor-gateway'
import { UsageGateway } from '../../../domain/gateway/usage-gateway'
import { AuthData } from 'firebase-functions/v2/tasks'
import { StructuredAdvice } from '../../../domain/entities/structured-advice'

export class GetMedicationAdvice {
    constructor(
        private readonly medicationRepository: MedicationRepository,
        private readonly advisorGateway: AdvisorGateway,
        private readonly usageGateway: UsageGateway
    ) {}

    async execute(symptom: string, language: string, auth: AuthData): Promise<StructuredAdvice> {
        // Enforce quota limit (5 per day) before generating advice
        await this.usageGateway.checkAndIncrementUsage(auth.uid, 5)

        const medications = await this.medicationRepository.list(auth)
        
        if (medications.length === 0) {
            return {
                explanation: language === 'fr'
                    ? "Vous n'avez pas de médicaments dans votre armoire. Veuillez consulter un médecin."
                    : "You don't have any medications in your cabinet to check. Please consult a doctor.",
                usableMedications: []
            }
        }

        return await this.advisorGateway.getAdvice(symptom, medications, language)
    }
}
