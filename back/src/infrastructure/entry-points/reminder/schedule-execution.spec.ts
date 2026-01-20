import * as functions from '../https-functions'

import firebaseFunctionsTest from 'firebase-functions-test'

import { ScheduleExecution } from '../../../application/usecases/reminder/schedule-execution'
jest.mock('../../../application/usecases/reminder/schedule-execution')

const testEnv = firebaseFunctionsTest()

describe('scheduleReminderTask Trigger', () => {
    it('should call ScheduleReminderExecution when a reminder is created', async () => {
        const useCaseSpy = ScheduleExecution.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(undefined)

        const wrapped = testEnv.wrap(functions.scheduleReminderTask)

        const mockSnap = testEnv.firestore.makeDocumentSnapshot({
            userId: 'user-123',
            medName: 'Doliprane',
            quantity: 1,
            // Pass a real Date. testEnv will treat this as a Timestamp
            scheduledTime: new Date(),
            status: 'pending',
        }, 'reminders/reminder-abc')

        const event = {
            data: mockSnap,
            params: { id: 'reminder-abc' },
        }

        await wrapped(event as any)

        expect(useCaseSpy).toHaveBeenCalled()
        // It should be called with an object matching the Reminder entity
        expect(useCaseSpy.mock.calls[0][0].reminderId).toBe('reminder-abc')
    })
})
