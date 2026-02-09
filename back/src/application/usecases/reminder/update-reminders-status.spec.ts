import { UpdateRemindersStatus } from './update-reminders-status'
import { ReminderRepository } from '../../../domain/repositories/reminder/reminder-repository'
import { TaskSchedulerPort } from '../../../domain/gateway/scheduler/task-scheduler-port'

describe('UpdateRemindersStatus Use Case', () => {
    let mockRepo: jest.Mocked<ReminderRepository>
    let mockScheduler: jest.Mocked<TaskSchedulerPort>
    let useCase: UpdateRemindersStatus

    beforeEach(() => {
        mockRepo = {
            nextId: jest.fn(),
            saveBatch: jest.fn(),
            getById: jest.fn(),
            updateRemindersStatus: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn(),
        } as any

        mockScheduler = {
            scheduleNotificationTask: jest.fn(),
            cancelNotificationTask: jest.fn().mockResolvedValue(undefined),
        }

        useCase = new UpdateRemindersStatus(mockRepo, mockScheduler)
    })

    it('should call the repository updateRemindersStatus method with correct IDs and status', async () => {
        // Arrange
        const mockIds = ['rem-1', 'rem-2']
        const status = 'done'

        // Act
        await useCase.execute(mockIds, status)

        // Assert
        expect(mockRepo.updateRemindersStatus).toHaveBeenCalledWith(mockIds, status)
    })

    it('should cancel tasks when status is done', async () => {
        // Arrange
        const mockIds = ['rem-1', 'rem-2']

        // Act
        await useCase.execute(mockIds, 'done')

        // Assert
        expect(mockScheduler.cancelNotificationTask).toHaveBeenCalledTimes(2)
        expect(mockScheduler.cancelNotificationTask).toHaveBeenCalledWith('rem-1')
        expect(mockScheduler.cancelNotificationTask).toHaveBeenCalledWith('rem-2')
    })

    it('should propagate errors if the repository update fails', async () => {
        // Arrange
        const mockIds = ['id-1']
        const status = 'failed'
        const errorMessage = 'Firestore write failed'
        mockRepo.updateRemindersStatus.mockRejectedValue(new Error(errorMessage))

        // Act & Assert
        await expect(useCase.execute(mockIds, status)).rejects.toThrow(errorMessage)
    })

    it('should handle different statuses correctly', async () => {
        // Arrange
        const mockIds = ['id-999']
        const status = 'failed'

        // Act
        await useCase.execute(mockIds, status)

        // Assert
        expect(mockRepo.updateRemindersStatus).toHaveBeenCalledWith(mockIds, 'failed')
    })
})
