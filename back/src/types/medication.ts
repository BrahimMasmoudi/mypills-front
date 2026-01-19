import { MedicationDetailDto } from './medicationDto'

export type Medication = {
    medicationId: string
    uid: string
    bareCode: string
    name: string
    expiryDate: Date
    expired: boolean
    quantity: number
    image: string
    email: string
    details? : MedicationDetailDto
}
