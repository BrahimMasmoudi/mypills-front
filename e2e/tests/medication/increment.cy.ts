import { medicationId, testEmail, testUid } from "../../support/e2e"

describe('Medication Quantity Updates', () => {
    it('should decrement the quantity when the minus button is clicked', () => {
        cy.callFirestore('set', `medications/${medicationId}`, {
            medicationId: medicationId,
            uid: testUid,
            email: testEmail,
            name: 'Doliprane 1000mg',
            quantity: 10, // Starting quantity
            expiryDate: new Date('2026-12-31').toISOString(),
        })

        cy.visit('/medications')

        cy.get('[data-cy="medication-card"]')
            .should('be.visible')
            .and('contain', '10')

        cy.get('[data-cy="increment-button"]')
            .click()

        cy.contains('11').should('be.visible')
    })
})