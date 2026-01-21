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
