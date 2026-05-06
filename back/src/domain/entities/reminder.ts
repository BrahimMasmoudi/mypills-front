export type ReminderStatus = 'pending' | 'done' | 'failed'

export interface Reminder {
    sicknessName: string
    reminderId: string
    userId: string
    medName: string
    medicationId: string
    quantity: string | number
    scheduledTime: Date
    status: ReminderStatus
}

export interface ScheduleRequestDto {
    sicknessName: string
    medication: { name: string, medicationId: string }
    startDate: string
    endDate: string
    doses: { time: string, quantity: string }[]
    timezone: string
}
export interface UpdateReminderRequestDto {
    oldSicknessName: string
    newSicknessName: string
    remindersToDelete: string[]
    medications: {
        name: string
        medicationId: string
        startDate: string
        endDate: string
        doses: { time: string, quantity: string | number }[]
    }[]
    timezone: string
}
