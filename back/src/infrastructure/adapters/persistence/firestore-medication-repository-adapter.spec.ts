import { FirestoreMedicationRepositoryAdapter } from './firestore-medication-repository-adapter'
import { Medication } from '../../../domain/entities/medication'
import { FieldValue } from 'firebase-admin/firestore'
import { FirestoreConnector } from '../connectors/firestore-connector'
import { AuthData } from 'firebase-functions/v2/tasks'

// 1. Mock FieldValue.increment
jest.mock('firebase-admin/firestore', () => {
    const original = jest.requireActual('firebase-admin/firestore')
    return {
        ...original,
        FieldValue: {
            increment: jest.fn((val: number) => ({ type: 'increment', value: val })),
        },
    }
})

describe('FirestoreMedicationRepositoryAdapter', () => {
    let mockConnector: jest.Mocked<FirestoreConnector>
    let mockCollection: any
    let mockDoc: jest.Mock
    let mockSet: jest.Mock
    let mockUpdate: jest.Mock
    let mockDelete: jest.Mock
    let mockGet: jest.Mock
    let mockQueryBuilder: any
    let mockBatch: any
    let mockFirestore: any
    let adapter: FirestoreMedicationRepositoryAdapter

    // Fake Auth Data
    const fakeAuth = { uid: 'user-456' } as AuthData

    beforeEach(() => {
        jest.clearAllMocks()

        mockSet = jest.fn().mockResolvedValue(undefined)
        mockUpdate = jest.fn().mockResolvedValue(undefined)
        mockDelete = jest.fn().mockResolvedValue(undefined)

        // Mocking the .get() for the "ownership check" inside getSecureDocRef
        mockGet = jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ userId: 'user-456' }), // Matches fakeAuth.uid
            ref: { update: mockUpdate, delete: mockDelete },
        })

        mockDoc = jest.fn().mockReturnValue({
            set: mockSet,
            update: mockUpdate,
            delete: mockDelete,
            get: mockGet,
        })

        mockQueryBuilder = {
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            get: mockGet,
        }

        mockCollection = {
            doc: mockDoc,
            where: jest.fn().mockReturnValue(mockQueryBuilder),
        }

        mockBatch = {
            update: jest.fn().mockReturnThis(),
            commit: jest.fn().mockResolvedValue(undefined),
        }

        mockFirestore = {
            batch: jest.fn().mockReturnValue(mockBatch),
        }

        mockConnector = {
            collection: jest.fn().mockReturnValue(mockCollection),
            firestore: mockFirestore,
        } as unknown as any

        adapter = new FirestoreMedicationRepositoryAdapter(mockConnector)
    })

    const createFakeMedication = (overrides?: Partial<Medication>): Medication => ({
        medicationId: 'med-123',
        uid: 'user-456',
        bareCode: '3400930000000',
        name: 'Doliprane',
        expiryDate: new Date('2025-12-31'),
        expired: false,
        quantity: 10,
        image: 'https://example.com/image.png',
        email: 'test@example.com',
        ...overrides,
    })

    describe('create', () => {
        it('should call firestore with userId from auth', async () => {
            const medication = createFakeMedication()
            await adapter.create(medication, fakeAuth)
            expect(mockDoc).toHaveBeenCalledWith(medication.medicationId)
            expect(mockSet).toHaveBeenCalledWith(
                { ...medication, userId: fakeAuth.uid },
                { merge: false }
            )
        })
    })

    describe('increment/decrement', () => {
        it('should increment quantity if ownership is valid', async () => {
            const medication = createFakeMedication()
            await adapter.increment(medication, fakeAuth)
            expect(mockGet).toHaveBeenCalled()
            expect(mockUpdate).toHaveBeenCalledWith({ quantity: FieldValue.increment(1) })
        })

        it('should throw error if user does not own document', async () => {
            // Change ownership to someone else
            mockGet.mockResolvedValueOnce({
                exists: true,
                data: () => ({ userId: 'wrong-user' }),
            })
            const medication = createFakeMedication()
            await expect(adapter.increment(medication, fakeAuth))
                .rejects.toThrow('You do not own this medication.')
        })
    })

    describe('setExpiredStatus', () => {
        it('should filter by userId in the query and update batch', async () => {
            const ids = ['med-1', 'med-2']

            // Mocking query result for the batch update
            mockGet.mockResolvedValueOnce({
                empty: false,
                size: 2,
                docs: [
                    { ref: { id: 'med-1' } },
                    { ref: { id: 'med-2' } },
                ],
            })

            const result = await adapter.setExpiredStatus(ids, fakeAuth)

            expect(mockCollection.where).toHaveBeenCalledWith('userId', '==', fakeAuth.uid)
            expect(mockBatch.update).toHaveBeenCalledTimes(2)
            expect(result.updated).toBe(2)
        })
    })

    describe('fetchTunisianMedications', () => {
        it('should map search results correctly', async () => {
            mockGet.mockResolvedValueOnce({
                docs: [{ id: 'tun-1', data: () => ({ name: 'Doliprane' }) }],
            })

            const result = await adapter.fetchTunisianMedications('Doli')
            expect(result[0]).toEqual({ id: 'tun-1', name: 'Doliprane' })
        })
    })
})
