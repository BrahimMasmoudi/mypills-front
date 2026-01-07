import type {Medication} from "~/types/medication";

export interface Dose {
    time: string
    quantity: number
}

export interface CreateReminderRequest {
    medication: Medication
    startDate: Date
    endDate: Date
    doses: Dose[]
}