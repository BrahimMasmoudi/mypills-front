import firebaseFunctionsTest from 'firebase-functions-test'
import * as functions from '../https-functions'

import { CreateSchedule } from '../../../application/usecases/reminder/create-schedule'

const testEnv = firebaseFunctionsTest()
jest.mock('../../../application/usecases/reminder/create-schedule')

describe('createSchedule Entry Point', () => {
    it('should call CreateSchedule use case and return success', async () => {
        const useCaseSpy = CreateSchedule.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(undefined)

        const wrapped = testEnv.wrap(functions.createSchedule)
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
