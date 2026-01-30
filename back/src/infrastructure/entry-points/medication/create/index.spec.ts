import firebaseFunctionsTest from 'firebase-functions-test'
import * as admin from 'firebase-admin'
import { CreateMedication } from '../../../../application/usecases/medication/create-medication/create-medication'
import * as functions from '../../https-functions'
import { AuthData } from 'firebase-functions/v2/tasks'

const testEnv = firebaseFunctionsTest()

if (admin.apps.length === 0) {
    admin.initializeApp()
}

jest.mock('../../../../application/usecases/medication/create-medication/create-medication')

describe('HTTPS Functions Entry Point', () => {
    const mockAuth: AuthData = {
        uid: 'user-123',
        token: {
            uid: 'user-123',
            email: 'test@example.com',
        },
    } as any

    afterAll(() => {
        testEnv.cleanup()
    })

    it('should call the use case and return success when authenticated', async () => {
        // Given
        const mockMedication = { medicationId: 'med-456', name: 'Doliprane' }
        const useCaseSpy = CreateMedication.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(undefined)

        // When
        const wrapped = testEnv.wrap(functions.createMedication)

        const result = await wrapped({
            data: { medication: mockMedication },
            auth: mockAuth,
        } as any)

        // Then
        expect(useCaseSpy).toHaveBeenCalledWith(mockMedication, mockAuth)
        expect(result).toEqual({ success: true })
    })

    it('should throw "unauthenticated" error if auth is missing', async () => {
        // Given
        const wrapped = testEnv.wrap(functions.createMedication)

        // Then
        await expect(wrapped({
            data: { medication: { medicationId: '123' } },
        } as any)).rejects.toThrow(/must be called while authenticated/i)
    })

    it('should map domain errors to internal HttpsError', async () => {
        // Given
        const useCaseSpy = CreateMedication.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new Error('Domain Error'))

        const wrapped = testEnv.wrap(functions.createMedication)

        // Then
        await expect(wrapped({
            data: { medication: { medicationId: '123' } },
            auth: mockAuth,
        }as any)).rejects.toThrow('Could not create medication')
    })
})
