import { initializeApp, getApp, deleteApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { credential } from 'firebase-admin'
import {FirestoreCisLookupAdapter} from "../../infrastructure/adapters/persistence/firestore-cis-lookup-adapter";
import {FirestoreConnector} from "../../infrastructure/adapters/connectors/firestore-connector";
import {Cip13} from "../../types/cip13";
import {Cis} from "../../types/cis";

describe('FirestoreCisLookupAdapter Integration Test', () => {
    let adapter: FirestoreCisLookupAdapter
    let firestore: any

    beforeAll(() => {
        const app = initializeApp({
            credential: credential.applicationDefault()
        }, 'cis-lookup-test')

        firestore = getFirestore(app)
        const connector = new FirestoreConnector(firestore)
        adapter = new FirestoreCisLookupAdapter(connector)
    })

    afterAll(async () => {
        await deleteApp(getApp('cis-lookup-test'))
    })

    it('should return a Cis object when a valid Cip13 is found', async () => {
        // Arrange: Prepare a test document in the real Firestore
        const testCip = Cip13.create('3400934913154')
        const testCisString = '61234567'
        await firestore.collection('cip_to_cis').doc(testCip.getValue()).set({
            cis: testCisString
        })

        // Act
        const result = await adapter.getCisByCip13(testCip)

        // Assert
        expect(result).not.toBeNull()
        expect(result?.getValue()).toBe(testCisString)
        expect(result).toBeInstanceOf(Cis)

        // Cleanup
        await firestore.collection('cip_to_cis').doc(testCip.getValue()).delete()
    })

    it('should return null when the Cip13 does not exist', async () => {
        const nonExistentCip = Cip13.create('3400930005742')
        const result = await adapter.getCisByCip13(nonExistentCip)
        expect(result).toBeNull()
    })
})