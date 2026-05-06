import firebaseFunctionsTest from 'firebase-functions-test'
import * as functions from '../https-functions'
import { SaveUserToken } from '../../../application/usecases/user/save-token'

const testEnv = firebaseFunctionsTest()
jest.mock('../../../application/usecases/user/save-token')
jest.mock('../../adapters/user/firestore-user-repository-adapter')

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
