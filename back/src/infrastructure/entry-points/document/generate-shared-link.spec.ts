import * as functions from '../https-functions'
import firebaseFunctionsTest from 'firebase-functions-test'
import { HttpsError } from 'firebase-functions/v2/https'
import { CreateSharedLink } from '../../../application/usecases/document/create-shared-link'

// Mock CreateSharedLink Use Case (auto-mock)
jest.mock('../../../application/usecases/document/create-shared-link')

// Mock Adapter just to avoid import errors if any
jest.mock('../../adapters/document/firebase-storage-adapter')

const testEnv = firebaseFunctionsTest()

describe('generateSharedLink', () => {
    let mockExecute: jest.Mock

    beforeEach(() => {
        mockExecute = jest.fn();
        (CreateSharedLink as unknown as jest.Mock).mockImplementation(() => ({
            execute: mockExecute,
        }))
    })

    afterEach(() => {
        testEnv.cleanup()
        jest.clearAllMocks()
    })

    it('should throw unauthenticated error if no user ID', async () => {
        const wrapped = testEnv.wrap(functions.generateSharedLink)
        await expect(wrapped({ data: {} } as any)).rejects.toThrow(HttpsError)
        await expect(wrapped({ data: {} } as any)).rejects.toThrow('User must be logged in.')
    })

    it('should throw invalid-argument error if storagePath is missing', async () => {
        const wrapped = testEnv.wrap(functions.generateSharedLink)
        const context = { auth: { uid: 'user-123' } }
        await expect(wrapped({ data: {}, ...context } as any)).rejects.toThrow('Storage path is required.')
    })

    it('should handle permission-denied from Use Case', async () => {
        const wrapped = testEnv.wrap(functions.generateSharedLink)
        const context = { auth: { uid: 'user-123' } }
        const data = { storagePath: 'users/other-user/doc.pdf' }

        mockExecute.mockRejectedValue(new Error('Permission denied: You can only share your own documents.'))

        await expect(wrapped({ data, ...context } as any)).rejects.toThrow(HttpsError)
        await expect(wrapped({ data, ...context } as any)).rejects.toThrow('Permission denied')
    })

    it('should handle not-found from Use Case', async () => {
        const wrapped = testEnv.wrap(functions.generateSharedLink)
        const context = { auth: { uid: 'user-123' } }
        const data = { storagePath: 'users/user-123/missing.pdf' }

        mockExecute.mockRejectedValue(new Error('Document not found.'))

        await expect(wrapped({ data, ...context } as any)).rejects.toThrow(HttpsError)
        await expect(wrapped({ data, ...context } as any)).rejects.toThrow('Document not found.')
    })

    it('should return result from Use Case on success', async () => {
        const wrapped = testEnv.wrap(functions.generateSharedLink)
        const context = { auth: { uid: 'user-123' } }
        const data = { storagePath: 'users/user-123/folder/doc.pdf' }

        const expectedResult = { url: 'https://signed-url.com', expires: '2023-01-01' }
        mockExecute.mockResolvedValue(expectedResult)

        const result = await wrapped({ data, ...context } as any)

        expect(result).toEqual(expectedResult)
        expect(mockExecute).toHaveBeenCalledWith('user-123', data.storagePath)
    })
})
