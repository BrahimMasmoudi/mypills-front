import {
    FirestoreMedicationRepositoryAdapter,
} from '../../../infrastructure/adapters/persistence/firestore-medication-repository-adapter'
import { Medication } from '../../entities/medication'
import { AuthData } from 'firebase-functions/v2/tasks'
import { FieldValue } from 'firebase-admin/firestore'
import { HttpsError } from 'firebase-functions/v2/https'

describe('FirestoreMedicationRepositoryAdapter', () => {
    let adapter: FirestoreMedicationRepositoryAdapter
    let mockConnector: any
    let mockCollection: any
    let mockTunisianCollection: any
    let mockDoc: any
    let mockBatch: any

    const fakeAuth = { uid: 'user-456' } as AuthData

    beforeEach(() => {
        mockDoc = {
            id: 'generated-id',
            set: jest.fn(),
            get: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            data: jest.fn(),
            exists: true, // Default to true
            ref: 'mock-ref'
        }

        const createQueryMock = () => {
            const queryMock: any = {
                where: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({
                    empty: true,
                    docs: [],
                    size: 0,
                    forEach: jest.fn()
                })
            }
            return queryMock
        }

        mockCollection = {
            doc: jest.fn().mockReturnValue(mockDoc),
            where: jest.fn().mockReturnValue(createQueryMock()),
            add: jest.fn(),
        }

        mockTunisianCollection = {
            doc: jest.fn().mockReturnValue(mockDoc),
            where: jest.fn().mockReturnValue(createQueryMock()),
            limit: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValue({ docs: [] }),
        }

        mockBatch = {
            set: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            commit: jest.fn(),
        }

        mockConnector = {
            collection: jest.fn((name) => {
                if (name === 'tunisian_meds') return mockTunisianCollection
                return mockCollection
            }),
            firestore: {
                batch: jest.fn().mockReturnValue(mockBatch),
            }
        }

        adapter = new FirestoreMedicationRepositoryAdapter(mockConnector)
    })

    const createId = () => `test-med-${Date.now()}`

    const createTestMedication = (id: string): Medication => ({
        medicationId: id,
        uid: 'test-user',
        bareCode: '123456',
        name: 'Integration Test Med',
        expiryDate: new Date(),
        expired: false,
        quantity: 5,
        image: '',
        email: 'test@test.com',
        updatedAt: new Date(),
        createdAt: new Date(),
        unitsPerBox: 10,
        numberOfBoxes: 1,
    })

    describe('Single Document Operations', () => {
        const uniqueId = createId()
        const testMedication = createTestMedication(uniqueId)

        it('should create document in Firestore', async () => {
            await adapter.create(testMedication, fakeAuth)

            expect(mockCollection.doc).toHaveBeenCalledWith(testMedication.medicationId)
            expect(mockDoc.set).toHaveBeenCalledWith({
                ...testMedication,
                uid: fakeAuth.uid,
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            }, { merge: false })
        })

        it('should increment the quantity', async () => {
            mockDoc.get.mockResolvedValue({
                exists: true,
                data: () => ({ uid: fakeAuth.uid }),
                ref: mockDoc
            })

            await adapter.increment(testMedication, fakeAuth)

            expect(mockCollection.doc).toHaveBeenCalledWith(testMedication.medicationId)
            expect(mockDoc.update).toHaveBeenCalledWith({
                quantity: FieldValue.increment(1),
                updatedAt: expect.any(Date),
            })
        })

        it('should decrement the quantity', async () => {
            mockDoc.get.mockResolvedValue({
                exists: true,
                data: () => ({ uid: fakeAuth.uid }),
                ref: mockDoc
            })

            await adapter.decrement(testMedication, fakeAuth)

            expect(mockCollection.doc).toHaveBeenCalledWith(testMedication.medicationId)
            expect(mockDoc.update).toHaveBeenCalledWith({
                quantity: FieldValue.increment(-1),
                updatedAt: expect.any(Date),
            })
        })

        it('should delete the document', async () => {
            mockDoc.get.mockResolvedValue({
                exists: true,
                data: () => ({ uid: fakeAuth.uid }),
                ref: mockDoc
            })

            await adapter.delete(testMedication, fakeAuth)

            expect(mockCollection.doc).toHaveBeenCalledWith(testMedication.medicationId)
            expect(mockDoc.delete).toHaveBeenCalled()
        })

        it('should throw permissions denied if user does not own medication', async () => {
            mockDoc.get.mockResolvedValue({
                exists: true,
                data: () => ({ uid: 'other-user' }),
                ref: mockDoc
            })

            await expect(adapter.delete(testMedication, fakeAuth)).rejects.toThrow(HttpsError)
        })
    })

    describe('Batch Operations', () => {
        it('should set expired status for multiple medications using a batch', async () => {
            const ids = ['id1', 'id2', 'id3']

            // Mock the query snapshot to return docs
            const mockDocs = ids.map(id => ({
                id,
                ref: 'mock-ref-' + id
            }))

            mockCollection.where.mockReturnValue({ // auth.uid check
                where: jest.fn().mockReturnValue({ // ids check
                    get: jest.fn().mockResolvedValue({
                        empty: false,
                        size: 3,
                        docs: mockDocs
                    })
                })
            })

            const result = await adapter.setExpiredStatus(ids, fakeAuth)

            expect(result.updated).toBe(3)
            expect(mockConnector.firestore.batch).toHaveBeenCalled()
            expect(mockBatch.update).toHaveBeenCalledTimes(3)
            expect(mockBatch.commit).toHaveBeenCalled()
        })

        it('should return updated: 0 when empty list provided', async () => {
            const result = await adapter.setExpiredStatus([], fakeAuth)
            expect(result.updated).toBe(0)
            expect(mockConnector.firestore.batch).not.toHaveBeenCalled()
        })
    })

    describe('fetchTunisianMedications', () => {
        it('should return medications matching the prefix query', async () => {
            const mockMeds = [
                { id: 'tn-1', data: () => ({ name: 'DOLIPRANE 500', cis: '6001', details: { form: 'Tab' } }) },
                { id: 'tn-2', data: () => ({ name: 'DOLIPRANE 1000', cis: '6002', details: { form: 'Cap' } }) }
            ]

            mockTunisianCollection.where.mockReturnValue({
                where: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        get: jest.fn().mockResolvedValue({
                            docs: mockMeds
                        })
                    })
                })
            })

            const results = await adapter.fetchTunisianMedications('DOLI')

            expect(results.length).toBe(2)
            expect(results[0].id).toBe('tn-1')
            expect(results[0].name).toBe('DOLIPRANE 500')
        })
    })
})
