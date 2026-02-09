import { medicationId, testEmail, testUid } from "../../support/e2e";

describe('Medication Deletion Flow', () => {
    it('should delete a medication through the UI and reflect in the database', () => {
        const medicationSeed = {
            medicationId: medicationId,
            uid: testUid,
            email: testEmail,
            name: 'Doliprane 1000mg',
            quantity: 10,
            expired: false,
            expiryDate: new Date('2026-12-31T23:59:59Z').toISOString(),
            details: {
                company: 'SANOFI AVENTIS FRANCE',
                ingredients: [{ substance: 'PARACÉTAMOL', dosage: '1000 mg' }]
            }
        }

        cy.callFirestore('set', `medications/${medicationId}`, medicationSeed)

        cy.visit('/medications')
        cy.get('[data-cy="medication-card"]').should('be.visible')

        cy.get(`[data-cy="delete-pill-button"]`).first().click()
        cy.get('[data-cy="confirm-deletion-button"]').click()

        // FIX 1: Wait for UI to sync (card disappears)
        cy.contains('Doliprane 1000mg').should('not.exist')

        // FIX 2: Check Firestore - wrap in a retry-able assertion
        cy.callFirestore('get', `medications/${medicationId}`).should('be.null')
    })
})