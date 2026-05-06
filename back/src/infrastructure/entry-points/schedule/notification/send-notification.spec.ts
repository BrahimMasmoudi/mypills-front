import * as functions from '../../https-functions'

import { SendReminderNotification } from '../../../../application/usecases/scheduler/notification/send-notification'
jest.mock('../../../../application/usecases/scheduler/notification/send-notification')

describe('sendFCMNotification Webhook', () => {
    it('should call SendReminderNotification and return 200', async () => {
        const useCaseSpy = SendReminderNotification.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(undefined)

        // Mock Express Request and Response
        const req = {
            body: { userId: 'u1', medName: 'Doli', medicationId: 'med-123', quantity: '1', reminderId: 'rem-123' },
        }
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        }

        // Call the function directly (since it's onRequest)
        await functions.sendFCMNotification(req as any, res as any)

        expect(useCaseSpy).toHaveBeenCalledWith({
            userId: 'u1',
            medName: 'Doli',
            medicationId: 'med-123',
            quantity: '1',
            reminderId: 'rem-123',
        })
        expect(res.status).toHaveBeenCalledWith(200)
    })
})
