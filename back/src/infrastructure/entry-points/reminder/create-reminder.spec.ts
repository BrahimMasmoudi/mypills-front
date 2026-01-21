import firebaseFunctionsTest from 'firebase-functions-test'
import * as functions from '../https-functions'

import { CreateReminder } from '../../../application/usecases/reminder/create-reminder'

const testEnv = firebaseFunctionsTest()
jest.mock('../../../application/usecases/reminder/create-reminder')

describe('createReminder Entry Point', () => {
    it('should call CreateSchedule use case and return success', async () => {
        const useCaseSpy = CreateReminder.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(undefined)

        const wrapped = testEnv.wrap(functions.createReminder)
        const mockData = {
            medication: { name: 'Doliprane' },
            startDate: '2024-01-01',
            endDate: '2024-01-02',
            doses: [{ time: '08:00', quantity: '1' }],
            timezone: 'Europe/Paris',
        }

        const result = await wrapped({
            data: mockData,
            auth: { uid: 'user-123' },
        } as any)

        expect(useCaseSpy).toHaveBeenCalledWith('user-123', mockData)
        expect(result).toEqual({ success: true })
    })
})
