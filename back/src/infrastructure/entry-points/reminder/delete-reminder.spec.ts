import * as functions from '../https-functions'
import firebaseFunctionsTest from 'firebase-functions-test'
import { DeleteReminder } from '../../../application/usecases/reminder/delete-reminder'

// 1. Mock the Use Case
jest.mock('../../../application/usecases/reminder/delete-reminder')

const testEnv = firebaseFunctionsTest()

describe('deleteReminder onCall Function', () => {
    afterAll(() => {
        testEnv.cleanup()
    })

    it('should call DeleteReminder use case and return success', async () => {
        // 2. Setup the Spy on the execute method
        const useCaseSpy = DeleteReminder.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(undefined)

        // 3. Wrap the v2 onCall function
        const wrapped = testEnv.wrap(functions.deleteReminder)

        // 4. Create mock request data (Reminder object)
        const mockReminderData = {
            reminderId: 'rem-123',
            sicknessName: 'Flu',
            userId: 'user-456',
            medName: 'Aspirin',
            quantity: 1,
            scheduledTime: new Date().toISOString(),
            status: 'pending',
        }

        // 5. Execute the wrapped function
        const result = await wrapped({
            data: mockReminderData,
            auth: { uid: 'user-456' }, // Simulating an authenticated user
        } as any)

        // 6. Assertions
        expect(useCaseSpy).toHaveBeenCalledTimes(1)
        expect(useCaseSpy).toHaveBeenCalledWith(mockReminderData)
        expect(result).toEqual({ success: true })
    })

    it('should throw an error if the use case fails', async () => {
        // Arrange
        const useCaseSpy = DeleteReminder.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new Error('Deletion failed'))

        const wrapped = testEnv.wrap(functions.deleteReminder)

        // Act & Assert
        await expect(wrapped({
            data: { reminderId: 'id-1' },
        } as any)).rejects.toThrow('Deletion failed')
    })
})
