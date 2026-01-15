import firebaseFunctionsTest from 'firebase-functions-test'
import * as admin from 'firebase-admin'
import {IncrementMedication} from '../../../application/usecases/increment-medication/increment-medication'
import * as functions from '../https-functions'

const testEnv = firebaseFunctionsTest()

if (admin.apps.length === 0) {
    admin.initializeApp()
}

// Mock the Use Case class
jest.mock('../../../application/usecases/increment-medication/increment-medication')

describe('incrementPills HTTPS Function', () => {
    afterAll(() => {
        testEnv.cleanup()
    })

    it('should call the increment use case and return success', async () => {
        // 1. Arrange
        const mockMedication = {medicationId: 'med-123', name: 'Doliprane'}

        // Get the mocked instance of the UseCase execute method
        const useCaseSpy = IncrementMedication.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(undefined)

        // Wrap the onCall function
        const wrapped = testEnv.wrap(functions.incrementPills)

        // 2. Act
        const result = await wrapped({
            data: {medication: mockMedication}
        } as any)

        // 3. Assert
        expect(useCaseSpy).toHaveBeenCalledWith(mockMedication)
        expect(result).toEqual({success: true})
    })

    it('should throw HttpsError when the increment use case fails', async () => {
        // 1. Arrange
        const useCaseSpy = IncrementMedication.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new Error('Database Failure'))

        const wrapped = testEnv.wrap(functions.incrementPills)

        // 2. Act & Assert
        // The catch block in your function maps any error to 'Could not increment medication'
        await expect(wrapped({
            data: {medication: {medicationId: 'error-id'}}
        } as any)).rejects.toThrow('Could not increment medication')
    })
})