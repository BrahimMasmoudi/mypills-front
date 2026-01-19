import { FirestoreMedicationRepositoryAdapter } from './firestore-medication-repository-adapter'
import { Medication } from '../../../domain/entities/medication'
import { CollectionReference, FieldValue } from 'firebase-admin/firestore'
import { FirestoreConnector } from '../connectors/firestore-connector'

// 1. Mock FieldValue.increment so we can verify it's called with the right value
// This needs to be at the top level of the file
jest.mock('firebase-admin/firestore', () => {
    const original = jest.requireActual('firebase-admin/firestore')
    return {
        ...original,
        FieldValue: {
            increment: jest.fn((val: number) => ({ type: 'increment', value: val }))
        }
    }
})

describe('FirestoreMedicationRepositoryAdapter', () => {
    let mockConnector: jest.Mocked<FirestoreConnector>
    let mockCollection: jest.Mocked<CollectionReference>
    let mockDoc: jest.Mock
    let mockSet: jest.Mock
    let mockUpdate: jest.Mock
    let mockDelete: jest.Mock
    let adapter: FirestoreMedicationRepositoryAdapter

    beforeEach(() => {
        // Reset all mocks before each test to ensure clean call counts
        jest.clearAllMocks()

        mockSet = jest.fn().mockResolvedValue(undefined)
        mockUpdate = jest.fn().mockResolvedValue(undefined)
        mockDelete = jest.fn().mockResolvedValue(undefined)

        // The doc method returns an object with set and update methods
        // We define this as a return value for mockDoc
        mockDoc = jest.fn().mockReturnValue({
            set: mockSet,
            update: mockUpdate,
            delete: mockDelete
        })

        // Mock the collection to return our mockDoc
        mockCollection = {
            doc: mockDoc
        } as unknown as jest.Mocked<CollectionReference>

        // Mock the connector to return our mockCollection
        mockConnector = {
            collection: jest.fn().mockReturnValue(mockCollection)
        } as unknown as jest.Mocked<FirestoreConnector>

        // Instantiate adapter with the mock connector
        adapter = new FirestoreMedicationRepositoryAdapter(mockConnector)
    })

    // Helper to create a valid medication for testing
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
        ...overrides
    })

    describe('create', () => {
        it('should call firestore with correct parameters when creating a medication', async () => {
            // Arrange
            const medication = createFakeMedication()

            // Act
            await adapter.create(medication)

            // Assert
            // Verify we target the correct collection string in the constructor/methods
            expect(mockConnector.collection).toHaveBeenCalledWith('medications')
            // Verify we targeted the correct document ID
            expect(mockDoc).toHaveBeenCalledWith(medication.medicationId)
            // Verify set was called with correct data and merge policy
            expect(mockSet).toHaveBeenCalledWith(medication, { merge: false })
        })

        it('should handle nested details correctly', async () => {
            // Arrange
            const medication = createFakeMedication({
                details: {
                    form: 'Tablet',
                    administrationRoutes: ['Oral'],
                    authStatus: 'Authorized',
                    procedureType: 'National',
                    marketingStatus: 'Active',
                    approvalDate: '2020-01-01',
                    company: 'Sanofi',
                    enhancedSurveillance: false,
                    ingredients: [{ substance: 'Paracetamol', dosage: '500mg', reference: 'Active' }],
                    presentations: [{ label: 'Box', barcode13: 3400930000000, refundRate: '65%', price: 2.10 }]
                }
            })

            // Act
            await adapter.create(medication)

            // Assert
            expect(mockSet).toHaveBeenCalledWith(medication, { merge: false })
        })
    })

    describe('increment', () => {
        it('should call update with FieldValue.increment when incrementing quantity', async () => {
            // Arrange
            const medication = createFakeMedication()

            // Act
            await adapter.increment(medication)

            // Assert
            // 1. Verify we target the specific medication document
            expect(mockDoc).toHaveBeenCalledWith(medication.medicationId)

            // 2. Verify we call update with the increment command
            expect(mockUpdate).toHaveBeenCalledWith({
                quantity: FieldValue.increment(1)
            })

            // 3. Verify the static increment helper was used correctly
            expect(FieldValue.increment).toHaveBeenCalledWith(1)
            expect(mockUpdate).toHaveBeenCalledTimes(1)
        })
    })

    describe('decrement', () => {
        it('should call update with FieldValue.increment(-1) when decrementing quantity', async () => {
            // Arrange
            const medication = createFakeMedication()

            // Act
            await adapter.decrement(medication)

            // Assert
            // 1. Verify we target the specific medication document
            expect(mockDoc).toHaveBeenCalledWith(medication.medicationId)

            // 2. Verify we call update with the correct negative increment
            expect(mockUpdate).toHaveBeenCalledWith({
                quantity: FieldValue.increment(-1)
            })

            // 3. Verify the static increment helper was used correctly with -1
            expect(FieldValue.increment).toHaveBeenCalledWith(-1)
            expect(mockUpdate).toHaveBeenCalledTimes(1)
        })
    })

    describe('delete', () => {
        it('should call firestore delete on the correct document', async () => {
            // Arrange
            const medication = createFakeMedication()

            // Act
            await adapter.delete(medication)

            // Assert
            // 1. Verify we requested the medications collection
            expect(mockConnector.collection).toHaveBeenCalledWith('medications')

            // 2. Verify we targeted the specific doc ID
            expect(mockDoc).toHaveBeenCalledWith(medication.medicationId)

            // 3. Verify the delete method was triggered
            expect(mockDelete).toHaveBeenCalledTimes(1)
        })
    })
})