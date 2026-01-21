import type {Medication} from '~/types/medication'

export interface Dose {
    time: string
    quantity: number
}

export interface CreateReminderRequest {
    sicknessName: string
    medication: Medication
    startDate: Date
    endDate: Date
    doses: Dose[]
    timezone: string
}

export interface Reminder {
    sicknessName: string
    reminderId: string
    userId: string
    medName: string
    quantity: string | number
    scheduledTime: Date
    status: 'pending' | 'sent' | 'failed'
}

export interface MedicationInfo {
    name: string
    doses: Dose[]
}

export interface ReminderGroup {
    sicknessName: string
    medNames: string[]
    medications: MedicationInfo[]
    startDate: Date
    endDate: Date
    ids: string[]
    status: 'pending' | 'sent' | 'failed'
    fullObject: Reminder
    doses: Dose[]
}
