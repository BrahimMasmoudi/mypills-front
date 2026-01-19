import { initializeApp, getApp, deleteApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { FirestoreMedicationRepositoryAdapter } from "../../infrastructure/adapters/persistence/firestore-medication-repository-adapter";
import { FirestoreConnector } from "../../infrastructure/adapters/connectors/firestore-connector";
import { Medication } from "../entities/medication";
import {credential} from "firebase-admin";

describe('FirestoreMedicationRepositoryAdapter Integration Test', () => {
    let adapter: FirestoreMedicationRepositoryAdapter
    let firestore: any

    beforeAll(() => {
        // Use applicationDefault() - it automatically looks at GOOGLE_APPLICATION_CREDENTIALS
        const app = initializeApp({
            credential: credential.applicationDefault()
        }, 'test-app')

        firestore = getFirestore(app)
        const connector = new FirestoreConnector(firestore)
        adapter = new FirestoreMedicationRepositoryAdapter(connector)
    })

    afterAll(async () => {
        const app = getApp('test-app');
        await deleteApp(app);
    });

    // Generate a unique ID for this specific test run
    const uniqueId = `test-med-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const testMedication: Medication = {
        medicationId: uniqueId,
        uid: 'test-user',
        bareCode: '123456',
        name: 'Integration Test Med',
        expiryDate: new Date(),
        expired: false,
        quantity: 5,
        image: '',
        email: 'test@test.com'
    }

    it('should create and then retrieve the document from Firestore', async () => {
        await adapter.create(testMedication)
        const doc = await firestore.collection('medications').doc(testMedication.medicationId).get()

        expect(doc.exists).toBe(true)
        expect(doc.data().name).toBe('Integration Test Med')
    })

    it('should increment the quantity in the real database', async () => {
        await adapter.increment(testMedication)
        const doc = await firestore.collection('medications').doc(testMedication.medicationId).get()
        expect(doc.data().quantity).toBe(6)
    })

    it('should delete the document', async () => {
        await adapter.delete(testMedication)
        const doc = await firestore.collection('medications').doc(testMedication.medicationId).get()
        expect(doc.exists).toBe(false)
    })
})