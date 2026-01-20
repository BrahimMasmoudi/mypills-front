import { ScheduleRequestDto, Reminder } from '../../../domain/entities/reminder'
import { parse, isBefore, isSameDay, addDays, format } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { v4 as uuidv4 } from 'uuid'
import { ReminderRepository } from '../../../domain/gateway/reminder/reminder-repository'

export class CreateSchedule {
    constructor(private reminderRepo: ReminderRepository) {
    }

    async execute(userId: string, request: ScheduleRequestDto): Promise<void> {
        const reminders: Reminder[] = []
        let currentDate = parse(request.startDate, 'yyyy-MM-dd', new Date())
        const end = parse(request.endDate, 'yyyy-MM-dd', new Date())

        while (isBefore(currentDate, end) || isSameDay(currentDate, end)) {
            request.doses.forEach((dose) => {
                if (!dose.time) return

                const dateTimeString = `${format(currentDate, 'yyyy-MM-dd')} ${dose.time}`
                const scheduledTime = fromZonedTime(dateTimeString, request.timezone)

                reminders.push({
                    reminderId: uuidv4(),
                    userId,
                    medName: request.medication.name,
                    quantity: dose.quantity,
                    scheduledTime,
                    status: 'pending',
                })
            })
            currentDate = addDays(currentDate, 1)
        }

        await this.reminderRepo.saveBatch(reminders)
    }
}
