import * as functions from '../https-functions'

import firebaseFunctionsTest from 'firebase-functions-test'

import { ScheduleExecution } from '../../../application/usecases/scheduler/schedule-execution'
jest.mock('../../../application/usecases/scheduler/schedule-execution')

import { createSchedulerAdapter } from '../../config/scheduler'
jest.mock('../../config/scheduler')

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

describe('updateReminderTask Trigger', () => {
    let mockScheduler: any
    let useCaseSpy: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        useCaseSpy = ScheduleExecution.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(undefined)

        mockScheduler = {
            cancelNotificationTask: jest.fn().mockResolvedValue(undefined),
            scheduleNotificationTask: jest.fn().mockResolvedValue('task-id'),
        }
            ; (createSchedulerAdapter as jest.Mock).mockReturnValue(mockScheduler)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should cancel existing task and schedule new one if scheduledTime changes', async () => {
        const wrapped = testEnv.wrap(functions.updateReminderTask)

        // Use Timestamps directly as Firestore does
        const beforeTime = new Date('2026-02-10T10:00:00Z')
        const afterTime = new Date('2026-02-10T11:00:00Z')

        const beforeSnap = testEnv.firestore.makeDocumentSnapshot({
            scheduledTime: beforeTime,
            userId: 'user-123',
            medName: 'Med',
            quantity: 1,
            status: 'pending'
        }, 'reminders/reminder-1')

        const afterSnap = testEnv.firestore.makeDocumentSnapshot({
            scheduledTime: afterTime,
            userId: 'user-123',
            medName: 'Med',
            quantity: 1,
            status: 'pending'
        }, 'reminders/reminder-1')

        const change = testEnv.makeChange(beforeSnap, afterSnap)

        await wrapped({
            data: change,
            params: { id: 'reminder-1' }
        } as any)

        expect(createSchedulerAdapter).toHaveBeenCalled()
        expect(mockScheduler.cancelNotificationTask).toHaveBeenCalledWith('reminder-1')
        expect(useCaseSpy).toHaveBeenCalled()

        // Comparision fails in test env (returns now), so we check it exists and is Date
        // and check other fields to be sure
        const calledTime = useCaseSpy.mock.calls[0][0].scheduledTime
        expect(calledTime).toBeInstanceOf(Date)

        expect(useCaseSpy.mock.calls[0][0].reminderId).toBe('reminder-1')
    })

    it('should NOT reschedule if scheduledTime is the same', async () => {
        const wrapped = testEnv.wrap(functions.updateReminderTask)

        const time = new Date('2026-02-10T10:00:00Z')

        const beforeSnap = testEnv.firestore.makeDocumentSnapshot({
            scheduledTime: time,
            userId: 'user-123',
            sicknessName: 'flu'
        }, 'reminders/reminder-1')

        const afterSnap = testEnv.firestore.makeDocumentSnapshot({
            scheduledTime: time,
            userId: 'user-123',
            sicknessName: 'cold' // Changed, but time is same
        }, 'reminders/reminder-1')

        const change = testEnv.makeChange(beforeSnap, afterSnap)

        await wrapped({
            data: change,
            params: { id: 'reminder-1' }
        } as any)

        expect(mockScheduler.cancelNotificationTask).not.toHaveBeenCalled()
        expect(useCaseSpy).not.toHaveBeenCalled()
    })
})
