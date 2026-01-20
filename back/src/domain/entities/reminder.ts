export interface Reminder {
    reminderId: string
    userId: string
    medName: string
    quantity: string | number
    scheduledTime: Date
    status: 'pending' | 'sent' | 'failed'
}

export interface ScheduleRequestDto {
    medication: { name: string }
    startDate: string
    endDate: string
    doses: { time: string, quantity: string }[]
    timezone: string
}
