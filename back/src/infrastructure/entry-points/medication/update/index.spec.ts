import firebaseFunctionsTest from 'firebase-functions-test'
import * as admin from 'firebase-admin'
import * as functions from '../../https-functions'
import { UpdateMedication } from "../../../../application/usecases/update-medication/update-medication"

const testEnv = firebaseFunctionsTest()

if (admin.apps.length === 0) {
    admin.initializeApp()
}

// Mock the Use Case class
jest.mock('../../../../application/usecases/update-medication/update-medication')

describe('HTTPS Functions Entry Point: updateMedication', () => {
    afterAll(() => {
        testEnv.cleanup()
    })

    it('should call the use case with correct arguments and return success', async () => {
        // 1. Arrange
        const mockMedication = { medicationId: '123', name: 'Doliprane' }
        const mockNewName = 'Doliprane 1000mg'

        const useCaseSpy = UpdateMedication.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(undefined)

        const wrapped = testEnv.wrap(functions.updateMedication)

        // 2. Act
        const result = await wrapped({
            data: {
                medication: mockMedication,
                key: 'name',         // Match the variable name in your function
                value: mockNewName   // Match the variable name in your function
            },
        } as any)

        // 3. Assert
        expect(useCaseSpy).toHaveBeenCalledWith(mockMedication, 'name', mockNewName)
        expect(result).toEqual({ success: true })
    })

    it('should throw HttpsError when the use case fails', async () => {
        // 1. Arrange
        const useCaseSpy = UpdateMedication.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new Error('Domain Error'))

        const wrapped = testEnv.wrap(functions.updateMedication)

        // 2. Act & Assert
        await expect(wrapped({
            data: { medication: {}, newName: 'test' },
        } as any)).rejects.toThrow('Could not update medication')
    })
})