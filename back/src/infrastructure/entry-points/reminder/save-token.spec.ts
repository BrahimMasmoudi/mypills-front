import firebaseFunctionsTest from 'firebase-functions-test'
import { SaveUserToken } from '../../../application/usecases/reminder/save-token'
import * as functions from '../https-functions'

const testEnv = firebaseFunctionsTest()
jest.mock('../../../application/usecases/reminder/save-token')

describe('saveUserToken Entry Point', () => {
    it('should call SaveUserToken use case', async () => {
        const useCaseSpy = SaveUserToken.prototype.execute as jest.Mock
        useCaseSpy.mockResolvedValue(undefined)

        const wrapped = testEnv.wrap(functions.saveUserToken)

        const result = await wrapped({
            data: { fcmToken: 'token-xyz' },
            auth: { uid: 'user-123' },
        } as any)

        expect(useCaseSpy).toHaveBeenCalledWith('user-123', 'token-xyz')
        expect(result).toEqual({ success: true })
    })
})
