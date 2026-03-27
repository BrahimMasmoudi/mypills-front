import { MedicationRepository } from '../../../domain/repositories/medication/medication-repository'
import { AdvisorGateway } from '../../../domain/gateway/advisor-gateway'
import { AuthData } from 'firebase-functions/v2/tasks'
import { StructuredAdvice } from '../../../domain/entities/structured-advice'

export class GetMedicationAdvice {
    constructor(
        private readonly medicationRepository: MedicationRepository,
        private readonly advisorGateway: AdvisorGateway
    ) {}

    async execute(symptom: string, language: string, auth: AuthData): Promise<StructuredAdvice> {
        const medications = await this.medicationRepository.list(auth)
        
        if (medications.length === 0) {
            return {
                explanation: "You don't have any medications in your cabinet to check. Please consult a doctor.",
                usableMedications: []
            }
        }

        return await this.advisorGateway.getAdvice(symptom, medications, language)
    }
}
