import firebaseFunctionsTest from 'firebase-functions-test'
import * as admin from 'firebase-admin'
import * as functions from '../../https-functions'
import { DeleteMedication } from '../../../../application/usecases/medication/delete-medication/delete-medication'
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

jest.mock('../../../../application/usecases/medication/delete-medication/delete-medication')

describe('HTTPS Functions Entry Point', () => {
    afterAll(() => {
        testEnv.cleanup()
    })

    it('should call the use case and return success', async () => {
        // 1. Arrange
        const mockMedication = { medicationId: '123', name: 'Doliprane' }

        // Get the mocked instance of the UseCase
        const useCaseSpy = DeleteMedication.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(undefined)

        // Wrap the function so we can call it
        const wrapped = testEnv.wrap(functions.deleteMedication)

        // 2. Act
        const result = await wrapped({
            data: { medication: mockMedication },
            auth: mockAuth,
        } as any)

        // 3. Assert
        expect(useCaseSpy).toHaveBeenCalledWith(mockMedication, mockAuth)
        expect(result).toEqual({ success: true })
    })

    it('should throw HttpsError when the use case fails', async () => {
        // 1. Arrange
        const useCaseSpy = DeleteMedication.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new Error('Domain Error'))

        const wrapped = testEnv.wrap(functions.deleteMedication)

        // 2. Act & Assert
        await expect(wrapped({
            data: { medication: {} },
            auth: mockAuth,
        } as any)).rejects.toThrow('Could not delete medication')
    })
})
