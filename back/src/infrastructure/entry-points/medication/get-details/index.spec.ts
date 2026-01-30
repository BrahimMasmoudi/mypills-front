import firebaseFunctionsTest from 'firebase-functions-test'
import * as admin from 'firebase-admin'
import * as functions from '../../https-functions'
import { GetMedicationDetails } from '../../../../application/usecases/medication/get-details/get-medication-details'
import { AuthData } from 'firebase-functions/v2/tasks'
import {Cip13} from "../../../../types/cip13";

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
jest.mock('../../../../application/usecases/medication/get-details/get-medication-details')

describe('HTTPS Functions Entry Point: getMedicationDetails', () => {
    afterAll(() => {
        testEnv.cleanup()
    })

    it('should call the use case with cip13 and return the details', async () => {
        // 1. Arrange
        const mockCip13 = Cip13.create('3400934913154')
        const mockDetails = {
            name: 'Doliprane 1000mg',
            cis: '61234567',
            details: { company: 'SANOFI' },
        }

        // Setup the mock to return specific data
        const useCaseSpy = GetMedicationDetails.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(mockDetails)

        const wrapped = testEnv.wrap(functions.getMedicationDetails)

        // 2. Act
        const result = await wrapped({
            data: { cip13: mockCip13.getValue() },
            auth: mockAuth,
        } as any)

        // 3. Assert
        expect(useCaseSpy).toHaveBeenCalledWith(mockCip13)
        expect(result).toEqual(mockDetails)
    })

    it('should throw HttpsError not-found when use case throws NOT_FOUND_IN_DB', async () => {
        // 1. Arrange
        const useCaseSpy = GetMedicationDetails.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new Error('NOT_FOUND_IN_DB'))

        const wrapped = testEnv.wrap(functions.getMedicationDetails)

        // 2. Act & Assert
        // The catch block in your function converts 'NOT_FOUND_IN_DB' to 'Medication not found in database'
        await expect(wrapped({
            data: { cip13: 'wrong-cip' },
            auth: mockAuth,
        } as any)).rejects.toThrow(/Medication not found in database/)
    })

    it('should throw internal error for other domain errors', async () => {
        // 1. Arrange
        const useCaseSpy = GetMedicationDetails.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new Error('Random API Failure'))

        const wrapped = testEnv.wrap(functions.getMedicationDetails)

        // 2. Act & Assert
        await expect(wrapped({
            data: { cip13: '3400934913154' },
            auth: mockAuth,
        } as any)).rejects.toThrow(/Search failed/)
    })
})
