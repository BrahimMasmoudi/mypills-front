import * as functions from '../https-functions'
import firebaseFunctionsTest from 'firebase-functions-test'
import { DeleteReminders } from '../../../application/usecases/reminder/delete-reminders'

// 1. Mock the Use Case
jest.mock('../../../application/usecases/reminder/delete-reminders')

const testEnv = firebaseFunctionsTest()

describe('deleteReminders onCall Function', () => {
    afterAll(() => {
        testEnv.cleanup()
    })

    it('should call DeleteReminders use case with an array of IDs and return success', async () => {
        // 2. Setup the Spy on the execute method
        const useCaseSpy = DeleteReminders.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(undefined)

        // 3. Wrap the v2 onCall function
        const wrapped = testEnv.wrap(functions.deleteReminders)

        // 4. Create mock request data (Array of strings/IDs)
        const mockIds = ['rem-123', 'rem-456']

        // 5. Execute the wrapped function
        const result = await wrapped({
            data: mockIds,
            auth: { uid: 'user-456' },
        } as any)

        // 6. Assertions
        expect(useCaseSpy).toHaveBeenCalledTimes(1)
        expect(useCaseSpy).toHaveBeenCalledWith(mockIds)
        expect(result).toEqual({ success: true })
    })

    it('should throw an error if the use case fails', async () => {
        // Arrange
        const useCaseSpy = DeleteReminders.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new Error('Deletion failed'))

        const wrapped = testEnv.wrap(functions.deleteReminders)

        // Act & Assert
        await expect(wrapped({
            data: ['id-1'],
        } as any)).rejects.toThrow('Deletion failed')
    })

    it('should throw HttpsError if data is not an array', async () => {
        const wrapped = testEnv.wrap(functions.deleteReminders)

        // Act & Assert
        try {
            await wrapped({ data: { not: 'an-array' } } as any)
            fail('Should have thrown an error')
        } catch (error: any) {
            expect(error.code).toBe('invalid-argument')
        }
    })
})
