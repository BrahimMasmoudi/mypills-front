import { ScheduleExecution } from './schedule-execution'
import { TaskSchedulerPort } from '../../../domain/gateway/scheduler/task-scheduler-port'
import { Reminder } from '../../../domain/entities/reminder'

describe('ScheduleExecution Use Case', () => {
    let mockScheduler: jest.Mocked<TaskSchedulerPort>
    let useCase: ScheduleExecution

    beforeEach(() => {
        mockScheduler = {
            scheduleNotificationTask: jest.fn().mockResolvedValue('task-name-123'),
            cancelNotificationTask: jest.fn().mockResolvedValue(undefined),
        }

        useCase = new ScheduleExecution(mockScheduler)
    })

    it('should call the scheduler with correctly mapped data from the reminder', async () => {
        // Arrange
        const mockReminder: Reminder = {
            sicknessName: 'sickness',
            reminderId: 'rem-abc',
            userId: 'user-123',
            medName: 'Doliprane',
            quantity: 2, // Number input
            scheduledTime: new Date('2026-01-20T10:00:00Z'),
            status: 'pending',
        }

        // Act
        await useCase.execute(mockReminder)

        // Assert
        expect(mockScheduler.scheduleNotificationTask).toHaveBeenCalledWith(
            'rem-abc',
            mockReminder.scheduledTime,
            {
                userId: 'user-123',
                medName: 'Doliprane',
                quantity: '2', // Verify it was converted to a string
                reminderId: 'rem-abc',
            }
        )
        expect(mockScheduler.scheduleNotificationTask).toHaveBeenCalledTimes(1)
    })

    it('should propagate errors if the scheduler fails', async () => {
        // Arrange
        mockScheduler.scheduleNotificationTask.mockRejectedValue(new Error('GCP Queue Error'))

        const mockReminder: Reminder = {
            sicknessName: 'sickness',
            reminderId: 'rem-abc',
            userId: 'user-123',
            medName: 'Doliprane',
            quantity: 1,
            scheduledTime: new Date(),
            status: 'pending',
        }

        // Act & Assert
        await expect(useCase.execute(mockReminder))
            .rejects
            .toThrow('GCP Queue Error')
    })
})
