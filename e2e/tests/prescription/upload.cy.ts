import { testEmail, testUid } from '../../support/e2e'

describe('Prescription Upload', () => {
    // Clean up before test to ensure clean state
    beforeEach(() => {
        // Delete any existing test documents from Storage before starting
        cy.task('deleteUserFolder', { uid: testUid, folderName: 'Test Folder' })

        // Also clean Firestore to be safe (optional but recommended for clean state)
        cy.callFirestore('delete', `users/${testUid}/documents`, {
            where: [
                ['folderName', '==', 'Test Folder']
            ]
        })
    })

    it('should upload a prescription PDF successfully', () => {
        cy.visit('/prescriptions')

        cy.get('.v-fab__container > .v-btn', { timeout: 15000 }).should('be.visible').click()

        cy.get('[data-cy="scan-document-button"]').should('be.visible').click()
        cy.get('[data-cy="document-scanner-dialog"]', { timeout: 5000 }).should('be.visible')

        cy.get('[data-cy="mode-pdf-btn"]').click()

        cy.get('[data-cy="folder-input"] input').type('Test Folder')

        cy.get('[data-cy="document-name-input"] input').type('Test Prescription')

        cy.get('input[type="file"]').selectFile('cypress/fixtures/test-prescription.pdf', { force: true })

        cy.get('[data-cy="document-scanner-dialog"]').contains('test-prescription.pdf', { timeout: 5000 }).should('be.visible')

        cy.get('[data-cy="confirm-upload-btn"]').click()

        cy.get('[data-cy="document-scanner-dialog"]', { timeout: 15000 }).should('not.exist')

        cy.contains('Test Folder', { timeout: 10000 }).should('be.visible')

        cy.contains('Test Folder').click()

        // Verify document appears inside the expanded folder
        cy.contains('Test Prescription', { timeout: 5000 }).should('be.visible')

        // Verify document exists in Firestore using cypress-firebase
        // limit is not supported in callFirestore with query in the same way, need to be careful
        // But the main issue is the collection path. App uses users/{uid}/documents
        cy.callFirestore('get', `users/${testUid}/documents`, {
            where: [
                ['folderName', '==', 'Test Folder'],
                ['name', '==', 'Test Prescription']
            ]
        }).then((docs) => {
            expect(docs).to.have.length.at.least(1)
            const doc = docs[0]
            expect(doc.name).to.equal('Test Prescription')
            expect(doc.folderName).to.equal('Test Folder')
            // Storage path contains timestamp, so we check using substring/regex match
            expect(doc.storagePath).to.include(`users/${testUid}/Test Folder/Test Prescription_`)
            expect(doc.storagePath).to.include('.pdf')

            // Log the storage path for verification
            cy.log('Document uploaded to:', doc.storagePath)
        })
    })
})
