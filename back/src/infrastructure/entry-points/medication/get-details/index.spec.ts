import firebaseFunctionsTest from 'firebase-functions-test'
import * as admin from 'firebase-admin'
import * as functions from '../../https-functions'
import { GetMedicationDetails } from '../../../../application/usecases/medication/get-details/get-medication-details'
import { AuthData } from 'firebase-functions/v2/tasks'
import { Cip13 } from '../../../../types/cip13'
import { ExternalApiError } from '../../../adapters/external/external-api-error'

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
    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterAll(() => {
        testEnv.cleanup()
    })

    it('should throw unauthenticated when auth context is missing', async () => {
        const wrapped = testEnv.wrap(functions.getMedicationDetails)

        await expect(wrapped({
            data: { cip13: '3400934913154' },
        } as any)).rejects.toMatchObject({
            code: 'unauthenticated',
        })
    })

    it('should throw invalid-argument when cip13 is missing or malformed without calling use case', async () => {
        const useCaseSpy = GetMedicationDetails.prototype.execute as jest.Mock
        const wrapped = testEnv.wrap(functions.getMedicationDetails)

        await expect(wrapped({
            data: { cip13: 'bad/../../cip' },
            auth: mockAuth,
        } as any)).rejects.toMatchObject({
            code: 'invalid-argument',
        })

        expect(useCaseSpy).not.toHaveBeenCalled()
    })

    it('should call the use case with cip13 and return the details', async () => {
        const mockCip13 = Cip13.create('3400934913154')
        const mockDetails = {
            name: 'Doliprane 1000mg',
            cis: '61234567',
            details: { company: 'SANOFI' },
        }

        const useCaseSpy = GetMedicationDetails.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(mockDetails)

        const wrapped = testEnv.wrap(functions.getMedicationDetails)

        const result = await wrapped({
            data: { cip13: mockCip13.getValue() },
            auth: mockAuth,
        } as any)

        expect(useCaseSpy).toHaveBeenCalledWith(mockCip13)
        expect(result).toEqual(mockDetails)
    })

    it('should throw HttpsError not-found when use case throws NOT_FOUND_IN_DB', async () => {
        const useCaseSpy = GetMedicationDetails.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new Error('NOT_FOUND_IN_DB'))

        const wrapped = testEnv.wrap(functions.getMedicationDetails)

        await expect(wrapped({
            data: { cip13: '3400999999999' },
            auth: mockAuth,
        } as any)).rejects.toMatchObject({
            code: 'not-found',
            message: 'Medication not found in database',
        })
    })

    it('should throw deadline-exceeded when ExternalApiError is TIMEOUT', async () => {
        const useCaseSpy = GetMedicationDetails.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new ExternalApiError('TIMEOUT', 'Timed out', { cis: '60234100', durationMs: 5000 }))

        const wrapped = testEnv.wrap(functions.getMedicationDetails)

        await expect(wrapped({
            data: { cip13: '3400934913154' },
            auth: mockAuth,
        } as any)).rejects.toMatchObject({
            code: 'deadline-exceeded',
        })
    })

    it('should throw unavailable when ExternalApiError is HTTP_ERROR, NETWORK_ERROR, or SCHEMA_ERROR', async () => {
        const useCaseSpy = GetMedicationDetails.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new ExternalApiError('HTTP_ERROR', 'HTTP 502', { httpStatus: 502 }))

        const wrapped = testEnv.wrap(functions.getMedicationDetails)

        await expect(wrapped({
            data: { cip13: '3400934913154' },
            auth: mockAuth,
        } as any)).rejects.toMatchObject({
            code: 'unavailable',
        })
    })

    it('should throw internal error for unexpected domain or repository failures', async () => {
        const useCaseSpy = GetMedicationDetails.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new Error('Random DB Failure'))

        const wrapped = testEnv.wrap(functions.getMedicationDetails)

        await expect(wrapped({
            data: { cip13: '3400934913154' },
            auth: mockAuth,
        } as any)).rejects.toMatchObject({
            code: 'internal',
            message: 'Search failed',
        })
    })
})
