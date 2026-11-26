import firebaseFunctionsTest from 'firebase-functions-test'
import * as admin from 'firebase-admin'
import * as functions from '../../https-functions' // Adjust path to your entry point
import { FetchTunisianMedication } from '../../../../application/usecases/medication/fetch-tunisian-medication/fetch-tunisian-medication'
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
jest.mock('../../../../application/usecases/medication/fetch-tunisian-medication/fetch-tunisian-medication')

describe('HTTPS Functions Entry Point: searchTunisianMeds', () => {
    afterAll(() => {
        testEnv.cleanup()
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call the use case with uppercase searchTerm and return results', async () => {
        // 1. Arrange
        const mockResults = [
            { id: '1', name: 'DOLIPRANE', dosage: '500mg' },
            { id: '2', name: 'DOLIPRANE', dosage: '1000mg' },
        ]

        const useCaseSpy = FetchTunisianMedication.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(mockResults)

        const wrapped = testEnv.wrap(functions.searchTunisianMeds)

        // 2. Act - Passing lowercase to test the function's .toUpperCase() logic
        const result = await wrapped({
            data: { query: 'doli' },
            auth: mockAuth,
        } as any)

        // 3. Assert
        expect(useCaseSpy).toHaveBeenCalledWith('DOLI')
        expect(result).toEqual(mockResults)
    })

    it('should return an empty array if query length is less than 2', async () => {
        // 1. Arrange
        const wrapped = testEnv.wrap(functions.searchTunisianMeds)
        const useCaseSpy = FetchTunisianMedication.prototype.execute as jest.Mock

        // 2. Act
        const result = await wrapped({
            data: { query: 'd' },
            auth: mockAuth,
        } as any)

        // 3. Assert
        expect(result).toEqual([])
        expect(useCaseSpy).not.toHaveBeenCalled()
    })

    it('should throw unauthenticated error if auth is missing', async () => {
        // 1. Arrange
        const wrapped = testEnv.wrap(functions.searchTunisianMeds)

        // 2. Act & Assert
        await expect(wrapped({
            data: { query: 'doliprane' },
            auth: undefined, // Missing auth
        } as any)).rejects.toThrow(/must be called while authenticated/)
    })

    it('should throw internal HttpsError if use case execution fails', async () => {
        // 1. Arrange
        const useCaseSpy = FetchTunisianMedication.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new Error('Database Connection Error'))

        const wrapped = testEnv.wrap(functions.searchTunisianMeds)

        // 2. Act & Assert
        await expect(wrapped({
            data: { query: 'doliprane' },
            auth: mockAuth,
        } as any)).rejects.toThrow(/fetch tunisian-medication failed/)
    })
})
