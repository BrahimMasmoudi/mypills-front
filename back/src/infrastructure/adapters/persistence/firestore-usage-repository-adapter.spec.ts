import { FirestoreUsageRepositoryAdapter } from './firestore-usage-repository-adapter'
import { FirestoreConnector } from '../connectors/firestore-connector'

describe('FirestoreUsageRepositoryAdapter', () => {
    let mockConnector: jest.Mocked<FirestoreConnector>
    let adapter: FirestoreUsageRepositoryAdapter
    let mockTransaction: any

    beforeEach(() => {
        mockTransaction = {
            get: jest.fn(),
            set: jest.fn(),
            update: jest.fn(),
        }

        mockConnector = {
            collection: jest.fn().mockReturnThis(),
            doc: jest.fn().mockReturnThis(),
            firestore: {
                runTransaction: jest.fn((callback) => callback(mockTransaction)),
            },
        } as unknown as jest.Mocked<FirestoreConnector>

        adapter = new FirestoreUsageRepositoryAdapter(mockConnector)
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2026-04-14T10:00:00Z'))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should set currentCount to 1 if document does not exist', async () => {
        mockTransaction.get.mockResolvedValueOnce({ exists: false })

        await adapter.checkAndIncrementUsage('user1', 5)

        expect(mockTransaction.set).toHaveBeenCalledWith(expect.anything(), {
            currentCount: 1,
            lastResetDate: '2026-04-14',
        })
        expect(mockTransaction.update).not.toHaveBeenCalled()
    })

    it('should increment currentCount if document exists and is on the same day under limit', async () => {
        mockTransaction.get.mockResolvedValueOnce({
            exists: true,
            data: () => ({ currentCount: 3, lastResetDate: '2026-04-14' }),
        })

        await adapter.checkAndIncrementUsage('user1', 5)

        expect(mockTransaction.update).toHaveBeenCalledWith(expect.anything(), {
            currentCount: 4,
        })
    })

    it('should throw an error if document exists, is on the same day, and reached the limit', async () => {
        mockTransaction.get.mockResolvedValueOnce({
            exists: true,
            data: () => ({ currentCount: 5, lastResetDate: '2026-04-14' }),
        })

        await expect(adapter.checkAndIncrementUsage('user1', 5)).rejects.toThrow('Daily AI usage quota exceeded.')
    })

    it('should reset currentCount to 1 if document exists but is from a previous day', async () => {
        mockTransaction.get.mockResolvedValueOnce({
            exists: true,
            data: () => ({ currentCount: 5, lastResetDate: '2026-04-13' }), // different day
        })

        await adapter.checkAndIncrementUsage('user1', 5)

        expect(mockTransaction.update).toHaveBeenCalledWith(expect.anything(), {
            currentCount: 1,
            lastResetDate: '2026-04-14',
        })
    })
})
