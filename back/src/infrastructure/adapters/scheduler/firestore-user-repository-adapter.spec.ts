import { FirestoreConnector } from '../connectors/firestore-connector'
import { Timestamp } from 'firebase-admin/firestore'
import { FirestoreUserRepositoryAdapter } from '../user/firestore-user-repository-adapter'

describe('FirestoreUserRepositoryAdapter', () => {
    let mockConnector: jest.Mocked<FirestoreConnector>
    let mockCollection: any
    let mockDoc: any
    let adapter: FirestoreUserRepositoryAdapter

    beforeEach(() => {
        // 1. Setup nested Firestore mocks
        mockDoc = {
            set: jest.fn().mockResolvedValue(undefined),
            get: jest.fn(),
        }

        mockCollection = {
            doc: jest.fn().mockReturnValue(mockDoc),
        }

        mockConnector = {
            collection: jest.fn().mockReturnValue(mockCollection),
        } as any

        adapter = new FirestoreUserRepositoryAdapter(mockConnector)
    })

    describe('saveFcmToken', () => {
        it('should save the token with merge: true', async () => {
            const userId = 'user-123'
            const token = 'fcm-token-abc'

            await adapter.saveFcmToken(userId, token)

            expect(mockCollection.doc).toHaveBeenCalledWith(userId)
            expect(mockDoc.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    fcmToken: token,
                    userId: userId,
                    lastTokenUpdate: expect.any(Timestamp),
                }),
                { merge: true }
            )
        })
    })

    describe('getDeviceToken', () => {
        it('should return the token if document exists', async () => {
            const userId = 'user-123'
            mockDoc.get.mockResolvedValue({
                exists: true,
                data: () => ({ fcmToken: 'stored-token' }),
            })

            const result = await adapter.getDeviceToken(userId)

            expect(mockCollection.doc).toHaveBeenCalledWith(userId)
            expect(result).toBe('stored-token')
        })

        it('should return null if document does not exist', async () => {
            mockDoc.get.mockResolvedValue({
                exists: false,
            })

            const result = await adapter.getDeviceToken('unknown')

            expect(result).toBeNull()
        })

        it('should return null if fcmToken is missing in data', async () => {
            mockDoc.get.mockResolvedValue({
                exists: true,
                data: () => ({ name: 'John Doe' }), // no fcmToken
            })

            const result = await adapter.getDeviceToken('user-1')

            expect(result).toBeNull()
        })
    })
})
