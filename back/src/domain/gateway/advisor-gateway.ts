import { Medication } from '../entities/medication'
import { StructuredAdvice } from '../entities/structured-advice'

export interface AdvisorGateway {
    getAdvice(symptom: string, cabinet: Medication[], language: string): Promise<StructuredAdvice>
}
