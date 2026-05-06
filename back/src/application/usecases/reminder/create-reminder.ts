import { ScheduleRequestDto, Reminder } from '../../../domain/entities/reminder'
import { parse, isBefore, isSameDay, addDays, format } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { ReminderRepository } from '../../../domain/repositories/reminder/reminder-repository'

export class CreateReminder {
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
                    sicknessName: request.sicknessName,
                    reminderId: this.reminderRepo.nextId(),
                    userId,
                    medName: request.medication.name,
                    medicationId: request.medication.medicationId,
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
