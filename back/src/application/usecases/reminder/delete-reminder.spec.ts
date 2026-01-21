import { DeleteReminder } from './delete-reminder'
import { ReminderRepository } from '../../../domain/repositories/reminder/reminder-repository'
import { Reminder } from '../../../domain/entities/reminder'

describe('DeleteReminder Use Case', () => {
    let mockRepo: jest.Mocked<ReminderRepository>
    let useCase: DeleteReminder

    beforeEach(() => {
        // 1. Setup the mock repository with the delete method
        mockRepo = {
            nextId: jest.fn(),
            saveBatch: jest.fn(),
            getById: jest.fn(),
            updateStatus: jest.fn(),
            delete: jest.fn().mockResolvedValue(undefined), // Mocking the delete method
        } as any

        useCase = new DeleteReminder(mockRepo)
    })

    it('should call the repository delete method with the correct reminder object', async () => {
        // Arrange
        const mockReminder: Reminder = {
            reminderId: 'rem-id-123',
            sicknessName: 'Flu',
            userId: 'user-789',
            medName: 'Paracetamol',
            quantity: 2,
            scheduledTime: new Date(),
            status: 'pending',
        }

        // Act
        await useCase.execute(mockReminder)

        // Assert
        // 1. Verify that the repository delete method was called exactly once
        expect(mockRepo.delete).toHaveBeenCalledTimes(1)

        // 2. Verify it was called with the exact reminder object passed to the use case
        expect(mockRepo.delete).toHaveBeenCalledWith(mockReminder)
    })

    it('should throw an error if the repository delete method fails', async () => {
        // Arrange
        const mockReminder: Reminder = { reminderId: 'id-1' } as Reminder
        const errorMessage = 'Database connection error'
        mockRepo.delete.mockRejectedValue(new Error(errorMessage))

        // Act & Assert
        // Verify that the use case propagates the error from the repository
        await expect(useCase.execute(mockReminder)).rejects.toThrow(errorMessage)
    })
})
