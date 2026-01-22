import { UpdateRemindersStatus } from './update-reminders-status'
import { ReminderRepository } from '../../../domain/repositories/reminder/reminder-repository'

describe('UpdateRemindersStatus Use Case', () => {
    let mockRepo: jest.Mocked<ReminderRepository>
    let useCase: UpdateRemindersStatus

    beforeEach(() => {
        // 1. Setup the mock repository with the updated batch method
        mockRepo = {
            nextId: jest.fn(),
            saveBatch: jest.fn(),
            getById: jest.fn(),
            updateRemindersStatus: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn(),
        } as any

        useCase = new UpdateRemindersStatus(mockRepo)
    })

    it('should call the repository updateRemindersStatus method with correct IDs and status', async () => {
        // Arrange
        const mockIds = ['rem-1', 'rem-2']
        const status = 'sent'

        // Act
        await useCase.execute(mockIds, status)

        // Assert
        // 1. Verify that the repository method was called exactly once
        expect(mockRepo.updateRemindersStatus).toHaveBeenCalledTimes(1)

        // 2. Verify it was called with the exact arguments
        expect(mockRepo.updateRemindersStatus).toHaveBeenCalledWith(mockIds, status)
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
