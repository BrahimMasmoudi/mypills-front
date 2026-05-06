import * as functions from '../https-functions' // Adjust path to your function export
import firebaseFunctionsTest from 'firebase-functions-test'
import { UpdateRemindersStatus } from '../../../application/usecases/reminder/update-reminders-status'

// 1. Mock the Use Case
jest.mock('../../../application/usecases/reminder/update-reminders-status')

const testEnv = firebaseFunctionsTest()

describe('updateRemindersStatus onCall Function', () => {
    afterAll(() => {
        testEnv.cleanup()
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call UpdateRemindersStatus use case and return success', async () => {
        // 2. Setup the Spy on the execute method
        const useCaseSpy = UpdateRemindersStatus.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(undefined)

        // 3. Wrap the v2 onCall function
        const wrapped = testEnv.wrap(functions.updateRemindersStatus)

        // 4. Create mock request data
        const mockData = {
            ids: ['rem-123', 'rem-456'],
            status: 'done',
        }

        // 5. Execute the wrapped function
        const result = await wrapped({
            data: mockData,
            auth: { uid: 'user-456' },
        } as any)

        // 6. Assertions
        expect(useCaseSpy).toHaveBeenCalledTimes(1)
        expect(useCaseSpy).toHaveBeenCalledWith(mockData.ids, mockData.status, undefined)
        expect(result).toEqual({ success: true })
    })

    it('should throw HttpsError if ids is not an array', async () => {
        const wrapped = testEnv.wrap(functions.updateRemindersStatus)

        const invalidData = {
            ids: 'not-an-array',
            status: 'done',
        }

        // Act & Assert
        try {
            await wrapped({ data: invalidData } as any)
            fail('Should have thrown an error')
        } catch (error: any) {
            expect(error.code).toBe('invalid-argument')
            expect(error.message).toContain('array of IDs')
        }
    })

    it('should throw HttpsError if status is invalid', async () => {
        const wrapped = testEnv.wrap(functions.updateRemindersStatus)

        const invalidData = {
            ids: ['id-1'],
            status: 'unknown-status',
        }

        // Act & Assert
        try {
            await wrapped({ data: invalidData } as any)
            fail('Should have thrown an error')
        } catch (error: any) {
            expect(error.code).toBe('invalid-argument')
            expect(error.message).toBe('Invalid status provided.')
        }
    })

    it('should propagate errors from the use case', async () => {
        // Arrange
        const useCaseSpy = UpdateRemindersStatus.prototype.execute as jest.Mock
        useCaseSpy.mockRejectedValue(new Error('Internal Database Error'))

        const wrapped = testEnv.wrap(functions.updateRemindersStatus)

        const mockData = {
            ids: ['id-1'],
            status: 'failed',
        }

        // Act & Assert
        await expect(wrapped({ data: mockData } as any)).rejects.toThrow('Internal Database Error')
    })
})
