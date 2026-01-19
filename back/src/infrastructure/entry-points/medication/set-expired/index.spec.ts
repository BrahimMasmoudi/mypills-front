import firebaseFunctionsTest from 'firebase-functions-test'
import * as admin from 'firebase-admin'
import * as functions from '../../https-functions'
import { SetExpiredStatus } from "../../../../application/usecases/medication/set-expired-status/set-expired-status";

const testEnv = firebaseFunctionsTest()

if (admin.apps.length === 0) {
    admin.initializeApp()
}

// Mock the Use Case class
jest.mock('../../../../application/usecases/medication/set-expired-status/set-expired-status')

describe('HTTPS Functions Entry Point: setExpiredStatus', () => {
    afterAll(() => {
        testEnv.cleanup()
    })

    it('should call the use case with an array of IDs and return the update count', async () => {
        // 1. Arrange
        const mockMedicationIds = ['id-1', 'id-2', 'id-3']
        const expectedResponse = { updated: 3 }

        // Get the mocked instance of the UseCase execute method
        const useCaseSpy = SetExpiredStatus.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(expectedResponse)

        const wrapped = testEnv.wrap(functions.setExpiredStatus)

        // 2. Act
        const result = await wrapped({
            data: {
                medicationIds: mockMedicationIds // Must match your Cloud Function 'data.medicationIds'
            },
        } as any)

        // 3. Assert
        // Verify the use case was called with the list of IDs
        expect(useCaseSpy).toHaveBeenCalledWith(mockMedicationIds)
        // Verify the function returns what the use case returned
        expect(result).toEqual(expectedResponse)
    })

    it('should throw HttpsError when the use case fails', async () => {
        // 1. Arrange
        const useCaseSpy = SetExpiredStatus.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new Error('Batch Update Failed'))

        const wrapped = testEnv.wrap(functions.setExpiredStatus)

        // 2. Act & Assert
        // Ensure the error message matches the one thrown in your Cloud Function's catch block
        await expect(wrapped({
            data: { medicationIds: ['id-1'] },
        } as any)).rejects.toThrow('Could not set medication status expired')
    })
})