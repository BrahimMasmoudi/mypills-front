import type {MedicationDetails} from "~/types/api";

export type Medication = {
    medicationId: string
    uid: string
    bareCode: string,
    name: string,
    expiryDate: Date
    expired: boolean,
    quantity: number
    image: string
    email: string
    details? : MedicationDetails
}

