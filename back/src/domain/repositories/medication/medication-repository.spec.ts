import { initializeApp, getApp, deleteApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import {
    FirestoreMedicationRepositoryAdapter,
} from '../../../infrastructure/adapters/persistence/firestore-medication-repository-adapter'
import { FirestoreConnector } from '../../../infrastructure/adapters/connectors/firestore-connector'
import { Medication } from '../../entities/medication'
import { credential } from 'firebase-admin'
import { AuthData } from 'firebase-functions/v2/tasks'

describe('FirestoreMedicationRepositoryAdapter Integration Test', () => {
    let adapter: FirestoreMedicationRepositoryAdapter
    let firestore: any
    const fakeAuth = { uid: 'user-456' } as AuthData

    beforeAll(() => {
        const app = initializeApp({
            credential: credential.applicationDefault(),
        }, 'test-app')

        firestore = getFirestore(app)
        const connector = new FirestoreConnector(firestore)
        adapter = new FirestoreMedicationRepositoryAdapter(connector)
    })

    afterAll(async () => {
        const app = getApp('test-app')
        await deleteApp(app)
    })

    // Helper to generate unique IDs to avoid collision in shared staging DB
    const createId = () => `test-med-${Date.now()}-${Math.floor(Math.random() * 1000)}`

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
    })

    describe('Single Document Operations', () => {
        const uniqueId = createId()
        const testMedication = createTestMedication(uniqueId)

        it('should create and then retrieve the document from Firestore', async () => {
            await adapter.create(testMedication, fakeAuth)
            const doc = await firestore.collection('medications').doc(testMedication.medicationId).get()

            expect(doc.exists).toBe(true)
            expect(doc.data().name).toBe('Integration Test Med')
        })

        it('should increment the quantity in the real database', async () => {
            await adapter.increment(testMedication, fakeAuth)
            const doc = await firestore.collection('medications').doc(testMedication.medicationId).get()
            expect(doc.data().quantity).toBe(6)
        })

        it('should delete the document', async () => {
            await adapter.delete(testMedication, fakeAuth)
            const doc = await firestore.collection('medications').doc(testMedication.medicationId).get()
            expect(doc.exists).toBe(false)
        })
    })

    describe('Batch Operations', () => {
        it('should set expired status for multiple medications using a batch', async () => {
            // 1. Arrange: Create 3 medications that are NOT expired
            const id1 = createId()
            const id2 = createId()
            const id3 = createId()
            const ids = [id1, id2, id3]

            await Promise.all([
                adapter.create(createTestMedication(id1), fakeAuth),
                adapter.create(createTestMedication(id2), fakeAuth),
                adapter.create(createTestMedication(id3), fakeAuth),
            ])

            // 2. Act: Run the batch update
            const result = await adapter.setExpiredStatus(ids, fakeAuth)

            // 3. Assert
            expect(result.updated).toBe(3)

            // Verify each document in Firestore
            for (const id of ids) {
                const doc = await firestore.collection('medications').doc(id).get()
                expect(doc.data().expired).toBe(true)
            }

            // Cleanup
            const batch = firestore.batch()
            ids.forEach((id) => batch.delete(firestore.collection('medications').doc(id)))
            await batch.commit()
        })

        it('should return updated: 0 when empty list provided', async () => {
            const result = await adapter.setExpiredStatus([], fakeAuth)
            expect(result.updated).toBe(0)
        })
    })

    describe('fetchTunisianMedications (Integration)', () => {
        const tunisianCollectionName = 'tunisian_meds'

        beforeAll(async () => {
            // Seed the database with known Tunisian medications
            const batch = firestore.batch()

            const medsToSeed = [
                { id: 'tn-1', name: 'DOLIPRANE 500', cis: '6001', details: { form: 'Tab' } },
                { id: 'tn-2', name: 'DOLIPRANE 1000', cis: '6002', details: { form: 'Cap' } },
                { id: 'tn-3', name: 'ASPIRINE', cis: '7001', details: { form: 'Tab' } },
            ]

            medsToSeed.forEach((med) => {
                const ref = firestore.collection(tunisianCollectionName).doc(med.id)
                batch.set(ref, { name: med.name, cis: med.cis, details: med.details })
            })

            await batch.commit()
        })

        it('should return medications matching the prefix query', async () => {
            // Act: Search for "DOLI"
            const results = await adapter.fetchTunisianMedications('DOLI')

            // Assert
            expect(results.length).toBeGreaterThanOrEqual(2)

            // Verify structure
            const doli500 = results.find((m) => m.name === 'DOLIPRANE 500')
            expect(doli500).toBeDefined()
            expect(doli500?.id).toBe('tn-1')
            expect(doli500?.details).toHaveProperty('form', 'Tab')
        })

        it('should respect the limit of 10 items', async () => {
            // Act
            const results = await adapter.fetchTunisianMedications('D')

            // Assert
            expect(results.length).toBeLessThanOrEqual(30)
        })

        it('should return an empty array if no names match the prefix', async () => {
            // Act
            const results = await adapter.fetchTunisianMedications('XYZ_NON_EXISTENT')

            // Assert
            expect(results).toEqual([])
        })

        afterAll(async () => {
            // Cleanup seeded meds
            const ids = ['tn-1', 'tn-2', 'tn-3']
            const batch = firestore.batch()
            ids.forEach((id) => {
                batch.delete(firestore.collection(tunisianCollectionName).doc(id))
            })
            await batch.commit()
        })
    })
})
