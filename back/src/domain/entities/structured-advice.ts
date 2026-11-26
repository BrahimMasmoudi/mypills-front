import { Medication } from './medication'

export interface StructuredAdvice {
    explanation: string
    usableMedications: Medication[]
}
