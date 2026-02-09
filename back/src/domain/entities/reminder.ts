export interface Reminder {
    sicknessName: string
    reminderId: string
    userId: string
    medName: string
    quantity: string | number
    scheduledTime: Date
    status: 'pending' | 'sent' | 'failed'
}

export interface ScheduleRequestDto {
    sicknessName: string
    medication: { name: string }
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
        startDate: string
        endDate: string
        doses: { time: string, quantity: string | number }[]
    }[]
    timezone: string
}
