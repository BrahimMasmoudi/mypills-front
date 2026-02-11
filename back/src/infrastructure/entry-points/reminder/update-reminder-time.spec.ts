import * as functions from '../https-functions'
import firebaseFunctionsTest from 'firebase-functions-test'
import { FirestoreReminderRepositoryAdapter } from '../../adapters/reminder/FirestoreReminderRepositoryAdapter'
import { HttpsError } from 'firebase-functions/v2/https'

jest.mock('../../adapters/reminder/FirestoreReminderRepositoryAdapter')

const testEnv = firebaseFunctionsTest()

describe('updateReminderTime', () => {
    let mockUpdateReminderTime: jest.Mock

    beforeEach(() => {
        mockUpdateReminderTime = jest.fn()
            ; (FirestoreReminderRepositoryAdapter as jest.Mock).mockImplementation(() => ({
                updateReminderTime: mockUpdateReminderTime,
            }))
    })

    afterEach(() => {
        testEnv.cleanup()
        jest.clearAllMocks()
    })

    it('should throw unauthenticated error if no user ID', async () => {
        const wrapped = testEnv.wrap(functions.updateReminderTime)
        await expect(wrapped({ data: {} } as any)).rejects.toThrow(HttpsError)
        await expect(wrapped({ data: {} } as any)).rejects.toThrow('no user found for this request.')
    })

    it('should throw invalid-argument error if id or newTime is missing', async () => {
        const wrapped = testEnv.wrap(functions.updateReminderTime)
        const context = { auth: { uid: 'user-123' } }

        // Missing id
        await expect(wrapped({ data: { newTime: '2023-01-01' }, ...context } as any)).rejects.toThrow('id and newTime are required.')

        // Missing newTime
        await expect(wrapped({ data: { id: 'rem-1' }, ...context } as any)).rejects.toThrow('id and newTime are required.')
    })

    it('should call repository updateReminderTime with correct arguments on success', async () => {
        const wrapped = testEnv.wrap(functions.updateReminderTime)
        const context = { auth: { uid: 'user-123' } }
        const newTimeStr = '2026-02-10T12:00:00.000Z'
        const data = {
            id: 'reminder-abc',
            newTime: newTimeStr
        }

        mockUpdateReminderTime.mockResolvedValue(undefined)

        const result = await wrapped({ data, ...context } as any)

        expect(result).toEqual({ success: true })
        expect(mockUpdateReminderTime).toHaveBeenCalledWith('reminder-abc', new Date(newTimeStr))
    })
})
