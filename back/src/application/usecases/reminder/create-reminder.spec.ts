import { CreateReminder } from './create-reminder'
import { ReminderRepository } from '../../../domain/repositories/reminder/reminder-repository'
import { ScheduleRequestDto } from '../../../domain/entities/reminder'

describe('CreateSchedule Use Case', () => {
    let mockRepo: jest.Mocked<ReminderRepository>
    let useCase: CreateReminder

    beforeEach(() => {
        // 1. Create a mock of the repository
        mockRepo = {
            nextId: jest.fn().mockReturnValue('mock-id'),
            saveBatch: jest.fn().mockResolvedValue(undefined),
            getById: jest.fn(),
            updateStatus: jest.fn(),
        } as any

        useCase = new CreateReminder(mockRepo)
    })

    it('should create correct number of reminders for a given date range and doses', async () => {
        // Arrange: 2 days, 2 doses per day = 4 reminders total
        const request: ScheduleRequestDto = {
            sicknessName: 'sickness',
            medication: { name: 'Doliprane' },
            startDate: '2024-01-01',
            endDate: '2024-01-02',
            timezone: 'Africa/Tunis',
            doses: [
                { time: '08:00', quantity: '1' },
                { time: '20:00', quantity: '1' },
            ],
        }
        const userId = 'user-123'

        // Act
        await useCase.execute(userId, request)

        // Assert
        // 1. Check if nextId was called 4 times
        expect(mockRepo.nextId).toHaveBeenCalledTimes(4)

        // 2. Check the batch save
        expect(mockRepo.saveBatch).toHaveBeenCalledTimes(1)
        const savedReminders = mockRepo.saveBatch.mock.calls[0][0]
        expect(savedReminders).toHaveLength(4)

        // 3. Verify data mapping of the first reminder
        expect(savedReminders[0]).toMatchObject({
            userId: 'user-123',
            medName: 'Doliprane',
            status: 'pending',
        })

        // 4. Verify the dates are consecutive (Jan 1st and Jan 2nd)
        const dates = savedReminders.map((r) => r.scheduledTime.toISOString())
        // Note: fromZonedTime will convert these to UTC based on the Africa/Tunis offset
        expect(dates[0]).toContain('2024-01-01T07:00:00') // Tunis is UTC+1 in Jan
        expect(dates[2]).toContain('2024-01-02T07:00:00')
    })

    it('should create reminders when start and end date are the same', async () => {
        // Arrange
        const request: ScheduleRequestDto = {
            sicknessName: 'sickness',
            medication: { name: 'Aspegic' },
            startDate: '2024-05-01',
            endDate: '2024-05-01',
            timezone: 'UTC',
            doses: [{ time: '12:00', quantity: '1' }],
        }

        // Act
        await useCase.execute('u1', request)

        // Assert
        const savedReminders = mockRepo.saveBatch.mock.calls[0][0]
        expect(savedReminders).toHaveLength(1)
        expect(savedReminders[0].scheduledTime.toISOString()).toBe('2024-05-01T12:00:00.000Z')
    })

    it('should not call saveBatch if no doses are provided', async () => {
        const request: ScheduleRequestDto = {
            sicknessName: 'sickness',
            medication: { name: 'Test' },
            startDate: '2024-01-01',
            endDate: '2024-01-02',
            timezone: 'UTC',
            doses: [], // Empty doses
        }

        await useCase.execute('u1', request)

        // Should not save anything
        expect(mockRepo.saveBatch).toHaveBeenCalledWith([])
    })
})
