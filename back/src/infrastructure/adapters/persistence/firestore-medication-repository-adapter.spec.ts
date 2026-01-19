import { FirestoreMedicationRepositoryAdapter } from './firestore-medication-repository-adapter'
import { Medication } from '../../../domain/entities/medication'
import { FieldValue } from 'firebase-admin/firestore'
import { FirestoreConnector } from '../connectors/firestore-connector'

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
    let mockCollection: any // Use any to allow adding mock methods like .where
    let mockDoc: jest.Mock
    let mockSet: jest.Mock
    let mockUpdate: jest.Mock
    let mockDelete: jest.Mock
    let mockGet: jest.Mock
    let mockQueryBuilder: any
    let mockBatch: any
    let mockFirestore: any
    let adapter: FirestoreMedicationRepositoryAdapter

    beforeEach(() => {
        jest.clearAllMocks()

        // Setup Document Methods
        mockSet = jest.fn().mockResolvedValue(undefined)
        mockUpdate = jest.fn().mockResolvedValue(undefined)
        mockDelete = jest.fn().mockResolvedValue(undefined)

        mockDoc = jest.fn().mockReturnValue({
            set: mockSet,
            update: mockUpdate,
            delete: mockDelete,
        })

        // Setup Query Chain Mocks
        mockGet = jest.fn()
        mockQueryBuilder = {
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            get: mockGet,
        }

        // Setup Collection with chaining support
        mockCollection = {
            doc: mockDoc,
            where: jest.fn().mockReturnValue(mockQueryBuilder),
        }

        // Setup Batch for setExpiredStatus
        mockBatch = {
            update: jest.fn().mockReturnThis(),
            commit: jest.fn().mockResolvedValue(undefined),
        }

        mockFirestore = {
            batch: jest.fn().mockReturnValue(mockBatch),
        }

        // Setup Connector
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
        it('should call firestore with correct parameters', async () => {
            const medication = createFakeMedication()
            await adapter.create(medication)
            expect(mockDoc).toHaveBeenCalledWith(medication.medicationId)
            expect(mockSet).toHaveBeenCalledWith(medication, { merge: false })
        })
    })

    describe('increment/decrement', () => {
        it('should increment quantity', async () => {
            const medication = createFakeMedication()
            await adapter.increment(medication)
            expect(mockUpdate).toHaveBeenCalledWith({ quantity: FieldValue.increment(1) })
        })

        it('should decrement quantity', async () => {
            const medication = createFakeMedication()
            await adapter.decrement(medication)
            expect(mockUpdate).toHaveBeenCalledWith({ quantity: FieldValue.increment(-1) })
        })
    })

    describe('update', () => {
        it('should update a specific key', async () => {
            const medication = createFakeMedication()
            await adapter.update(medication, 'name', 'New Name')
            expect(mockUpdate).toHaveBeenCalledWith({ name: 'New Name' })
        })
    })

    describe('delete', () => {
        it('should delete the document', async () => {
            const medication = createFakeMedication()
            await adapter.delete(medication)
            expect(mockDelete).toHaveBeenCalled()
        })
    })

    describe('setExpiredStatus', () => {
        it('should update multiple medications in a single batch', async () => {
            const ids = ['med-1', 'med-2', 'med-3']
            const result = await adapter.setExpiredStatus(ids)
            expect(mockFirestore.batch).toHaveBeenCalledTimes(1)
            expect(mockBatch.update).toHaveBeenCalledTimes(3)
            expect(result).toEqual({ updated: 3 })
        })

        it('should handle pagination (batches of 500)', async () => {
            const ids = Array.from({ length: 501 }, (_, i) => `id-${i}`)
            const result = await adapter.setExpiredStatus(ids)
            expect(mockFirestore.batch).toHaveBeenCalledTimes(2)
            expect(result.updated).toBe(501)
        })
    })

    describe('fetchTunisianMedications', () => {
        it('should build the correct query and return mapped medications', async () => {
            const query = 'Doli'
            const mockDocs = [
                {
                    id: 'tun-1',
                    data: jest.fn().mockReturnValue({ name: 'Doliprane' }),
                },
            ]
            mockGet.mockResolvedValue({ docs: mockDocs })

            const result = await adapter.fetchTunisianMedications(query)

            expect(mockCollection.where).toHaveBeenCalledWith('name', '>=', query)
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('name', '<=', query + '\uf8ff')
            expect(result[0]).toEqual({ id: 'tun-1', name: 'Doliprane' })
        })

        it('should return empty array when no documents found', async () => {
            mockGet.mockResolvedValue({ docs: [] })
            const result = await adapter.fetchTunisianMedications('Unknown')
            expect(result).toEqual([])
        })

        it('should catch Firestore errors and throw HttpsError', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
            mockGet.mockRejectedValue(new Error('Connection failed'))

            await expect(adapter.fetchTunisianMedications('Doli'))
                .rejects
                .toThrow('Search failed')

            consoleSpy.mockRestore()
        })
    })
})
