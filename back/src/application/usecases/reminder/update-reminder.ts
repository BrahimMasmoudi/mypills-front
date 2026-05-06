import { UpdateReminderRequestDto, Reminder } from '../../../domain/entities/reminder'
import { parse, isBefore, isSameDay, addDays, format } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { ReminderRepository } from '../../../domain/repositories/reminder/reminder-repository'

export class UpdateReminder {
    constructor(private reminderRepo: ReminderRepository) {
    }

    async execute(userId: string, request: UpdateReminderRequestDto): Promise<void> {
        // 1. Delete old reminders
        if (request.remindersToDelete.length > 0) {
            await this.reminderRepo.delete(request.remindersToDelete)
        }

        // 2. Create new reminders
        const reminders: Reminder[] = []

        request.medications.forEach(med => {
            let currentDate = parse(med.startDate, 'yyyy-MM-dd', new Date())
            const end = parse(med.endDate, 'yyyy-MM-dd', new Date())

            while (isBefore(currentDate, end) || isSameDay(currentDate, end)) {
                med.doses.forEach((dose) => {
                    if (!dose.time) return

                    const dateTimeString = `${format(currentDate, 'yyyy-MM-dd')} ${dose.time}`
                    const scheduledTime = fromZonedTime(dateTimeString, request.timezone)

                    reminders.push({
                        sicknessName: request.newSicknessName,
                        reminderId: this.reminderRepo.nextId(),
                        userId,
                        medName: med.name,
                        medicationId: med.medicationId,
                        quantity: dose.quantity,
                        scheduledTime,
                        status: 'pending',
                    })
                })
                currentDate = addDays(currentDate, 1)
            }
        })

        if (reminders.length > 0) {
            await this.reminderRepo.saveBatch(reminders)
        }
    }
}
