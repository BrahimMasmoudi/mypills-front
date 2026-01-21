import { DeleteReminders } from './delete-reminders'
import { ReminderRepository } from '../../../domain/repositories/reminder/reminder-repository'

describe('DeleteReminders Use Case', () => {
    let mockRepo: jest.Mocked<ReminderRepository>
    let useCase: DeleteReminders

    beforeEach(() => {
        // 1. Setup the mock repository
        mockRepo = {
            nextId: jest.fn(),
            saveBatch: jest.fn(),
            getById: jest.fn(),
            updateStatus: jest.fn(),
            delete: jest.fn().mockResolvedValue(undefined),
        } as any

        useCase = new DeleteReminders(mockRepo)
    })

    it('should call the repository delete method with the correct array of IDs', async () => {
        // Arrange
        const mockIds = ['rem-id-1', 'rem-id-2', 'rem-id-3']

        // Act
        await useCase.execute(mockIds)

        // Assert
        // 1. Verify that the repository delete method was called exactly once
        expect(mockRepo.delete).toHaveBeenCalledTimes(1)

        // 2. Verify it was called with the exact array of IDs
        expect(mockRepo.delete).toHaveBeenCalledWith(mockIds)
    })

    it('should throw an error if the repository delete method fails', async () => {
        // Arrange
        const mockIds = ['id-1']
        const errorMessage = 'Database connection error'
        mockRepo.delete.mockRejectedValue(new Error(errorMessage))

        // Act & Assert
        // Verify that the use case propagates the error from the repository
        await expect(useCase.execute(mockIds)).rejects.toThrow(errorMessage)
    })

    it('should handle an empty array of IDs gracefully', async () => {
        // Arrange
        const emptyIds: string[] = []

        // Act
        await useCase.execute(emptyIds)

        // Assert
        expect(mockRepo.delete).toHaveBeenCalledWith([])
    })
})
