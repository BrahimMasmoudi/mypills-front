import type { Medication } from '~/types/medication'

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

export interface ReminderGroup {
    sicknessName: string
    medName: string
    startDate: Date
    endDate: Date
    ids: string[]
    status: 'pending' | 'sent' | 'failed'
    doses: Dose[]
    fullObject: Reminder
    dosesMap?: Map<string, string | number>
}
