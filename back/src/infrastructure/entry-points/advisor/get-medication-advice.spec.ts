import firebaseFunctionsTest from 'firebase-functions-test'
import * as admin from 'firebase-admin'
import { GetMedicationAdvice } from '../../../application/usecases/advisor/get-medication-advice'
import * as functions from '../https-functions'
import { AuthData } from 'firebase-functions/v2/tasks'

const testEnv = firebaseFunctionsTest()

if (admin.apps.length === 0) {
    admin.initializeApp()
}

jest.mock('../../../application/usecases/advisor/get-medication-advice')

describe('HTTPS Functions Entry Point - getMedicationAdvice', () => {
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
        const useCaseSpy = GetMedicationAdvice.prototype.execute as jest.Mock
        const mockReply = { explanation: 'test explanation', usableMedications: [] }
        useCaseSpy.mockResolvedValue(mockReply)

        // When
        const wrapped = testEnv.wrap(functions.getMedicationAdvice)

        const result = await wrapped({
            data: { symptom: 'fever', language: 'fr' },
            auth: mockAuth,
        } as any)

        // Then
        expect(useCaseSpy).toHaveBeenCalledWith('fever', 'fr', mockAuth)
        expect(result).toEqual({ reply: mockReply })
    })

    it('should default language to en if not provided', async () => {
        // Given
        const useCaseSpy = GetMedicationAdvice.prototype.execute as jest.Mock
        const mockReply = { explanation: 'test', usableMedications: [] }
        useCaseSpy.mockResolvedValue(mockReply)

        // When
        const wrapped = testEnv.wrap(functions.getMedicationAdvice)

        const result = await wrapped({
            data: { symptom: 'fever' },
            auth: mockAuth,
        } as any)

        // Then
        expect(useCaseSpy).toHaveBeenCalledWith('fever', 'en', mockAuth)
        expect(result).toEqual({ reply: mockReply })
    })

    it('should throw "unauthenticated" error if auth is missing', async () => {
        // Given
        const wrapped = testEnv.wrap(functions.getMedicationAdvice)

        // Then
        await expect(wrapped({
            data: { symptom: 'fever' },
            auth: undefined
        } as any)).rejects.toThrow(/must be called while authenticated/i)
    })

    it('should throw "invalid-argument" error if symptom is missing', async () => {
        // Given
        const wrapped = testEnv.wrap(functions.getMedicationAdvice)

        // Then
        await expect(wrapped({
            data: { language: 'fr' },
            auth: mockAuth
        } as any)).rejects.toThrow(/Symptom is required/i)
    })

    it('should map domain errors to internal HttpsError', async () => {
        // Given
        const useCaseSpy = GetMedicationAdvice.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new Error('Domain Error'))

        const wrapped = testEnv.wrap(functions.getMedicationAdvice)

        // Then
        await expect(wrapped({
            data: { symptom: 'fever' },
            auth: mockAuth,
        } as any)).rejects.toThrow('Domain Error')
    })
})
