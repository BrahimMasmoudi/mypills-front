import {FirestoreMedicationRepositoryAdapter} from './FirestoreMedicationRepositoryAdapter'
import {Medication} from '../../../domain/entities/medication'
import {CollectionReference} from 'firebase-admin/firestore'
import {FirestoreConnector} from '../connectors/firestoreConnector'

describe('FirestoreMedicationRepositoryAdapter', () => {
    let mockConnector: jest.Mocked<FirestoreConnector>
    let mockCollection: jest.Mocked<CollectionReference>
    let mockDoc: jest.Mock
    let mockSet: jest.Mock
    let adapter: FirestoreMedicationRepositoryAdapter

    beforeEach(() => {
        // 1. Setup the Firestore deep mocks (set -> doc -> collection)
        mockSet = jest.fn().mockResolvedValue(undefined)
        mockDoc = jest.fn().mockReturnValue({set: mockSet})
        mockCollection = {
            doc: mockDoc
        } as unknown as jest.Mocked<CollectionReference>

        // 2. Mock the Connector to return our mockCollection
        mockConnector = {
            collection: jest.fn().mockReturnValue(mockCollection)
        } as unknown as jest.Mocked<FirestoreConnector>

        // 3. Instantiate adapter with the mock connector
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
        ...overrides
    })

    it('should call firestore with correct parameters when creating a medication', async () => {
        const medication = createFakeMedication()

        await adapter.create(medication)

        // Verify the connector was asked for the right collection
        expect(mockConnector.collection).toHaveBeenCalledWith('medications')

        // Verify the document ID was set correctly
        expect(mockDoc).toHaveBeenCalledWith(medication.medicationId)

        // Verify the data and merge options
        expect(mockSet).toHaveBeenCalledWith(medication, {merge: false})
    })

    it('should handle nested details correctly', async () => {
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
                ingredients: [{substance: 'Paracetamol', dosage: '500mg', reference: 'Active'}],
                presentations: [{label: 'Box of 16', barcode13: 3400930000000, refundRate: '65%', price: 2.10}]
            }
        })

        await adapter.create(medication)

        expect(mockSet).toHaveBeenCalledWith(medication, {merge: false})
    })
})