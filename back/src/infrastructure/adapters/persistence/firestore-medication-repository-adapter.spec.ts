import { FirestoreMedicationRepositoryAdapter } from './firestore-medication-repository-adapter'
import { Medication } from '../../../domain/entities/medication'
import { CollectionReference, FieldValue } from 'firebase-admin/firestore'
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
    let mockCollection: jest.Mocked<CollectionReference>
    let mockDoc: jest.Mock
    let mockSet: jest.Mock
    let mockUpdate: jest.Mock
    let mockDelete: jest.Mock
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

        // Setup Collection
        mockCollection = {
            doc: mockDoc,
        } as unknown as jest.Mocked<CollectionReference>

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
            firestore: mockFirestore, // The adapter uses this for .batch()
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
            // Arrange
            const ids = ['med-1', 'med-2', 'med-3']

            // Act
            const result = await adapter.setExpiredStatus(ids)

            // Assert
            expect(mockFirestore.batch).toHaveBeenCalledTimes(1)
            expect(mockBatch.update).toHaveBeenCalledTimes(3)
            expect(mockBatch.commit).toHaveBeenCalledTimes(1)

            // Verify specific calls
            expect(mockDoc).toHaveBeenCalledWith('med-1')
            expect(mockDoc).toHaveBeenCalledWith('med-2')
            expect(mockDoc).toHaveBeenCalledWith('med-3')
            expect(mockBatch.update).toHaveBeenCalledWith(expect.anything(), { expired: true })

            expect(result).toEqual({ updated: 3 })
        })

        it('should handle pagination (batches of 500)', async () => {
            // Arrange: 501 IDs should trigger 2 batches (500 + 1)
            const ids = Array.from({ length: 501 }, (_, i) => `id-${i}`)

            // Act
            const result = await adapter.setExpiredStatus(ids)

            // Assert
            expect(mockFirestore.batch).toHaveBeenCalledTimes(2)
            expect(mockBatch.commit).toHaveBeenCalledTimes(2)
            expect(mockBatch.update).toHaveBeenCalledTimes(501)
            expect(result.updated).toBe(501)
        })

        it('should return 0 if no IDs are provided', async () => {
            const result = await adapter.setExpiredStatus([])
            expect(mockFirestore.batch).not.toHaveBeenCalled()
            expect(result.updated).toBe(0)
        })

        it('should throw and log error if batch fails', async () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
            mockBatch.commit.mockRejectedValue(new Error('Firestore Error'))

            // Act & Assert
            await expect(adapter.setExpiredStatus(['1'])).rejects.toThrow('Firestore Error')
            expect(consoleSpy).toHaveBeenCalled()

            consoleSpy.mockRestore()
        })
    })
})
