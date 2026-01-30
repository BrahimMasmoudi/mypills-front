import firebaseFunctionsTest from 'firebase-functions-test'
import * as admin from 'firebase-admin'
import * as functions from '../../https-functions'
import { DecrementMedication } from '../../../../application/usecases/medication/decrement-medication/decrement-medication'
import { AuthData } from 'firebase-functions/v2/tasks'

const testEnv = firebaseFunctionsTest()

if (admin.apps.length === 0) {
    admin.initializeApp()
}

const mockAuth: AuthData = {
    uid: 'user-123',
    token: {
        uid: 'user-123',
        email: 'test@example.com',
    },
} as any

// Mock the Use Case class
jest.mock('../../../../application/usecases/medication/decrement-medication/decrement-medication')

describe('decrementPills HTTPS Function', () => {
    afterAll(() => {
        testEnv.cleanup()
    })

    it('should call the increment use case and return success', async () => {
        // 1. Arrange
        const mockMedication = { medicationId: 'med-123', name: 'Doliprane' }

        // Get the mocked instance of the UseCase execute method
        const useCaseSpy = DecrementMedication.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(undefined)

        // Wrap the onCall function
        const wrapped = testEnv.wrap(functions.decrementMedication)

        // 2. Act
        const result = await wrapped({
            data: { medication: mockMedication },
            auth: mockAuth,
        } as any)

        // 3. Assert
        expect(useCaseSpy).toHaveBeenCalledWith(mockMedication, mockAuth)
        expect(result).toEqual({ success: true })
    })

    it('should throw HttpsError when the decrement use case fails', async () => {
        // 1. Arrange
        const useCaseSpy = DecrementMedication.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new Error('Database Failure'))

        const wrapped = testEnv.wrap(functions.decrementMedication)

        // 2. Act & Assert
        // The catch block in your function maps any error to 'Could not increment medication'
        await expect(wrapped({
            data: { medication: { medicationId: 'error-id' } },
            auth: mockAuth,
        } as any)).rejects.toThrow('Could not decrement medication')
    })
})
