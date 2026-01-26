import {medicationId, testEmail, testUid} from "../../support/e2e";

describe('Medication Quantity Updates', () => {
    beforeEach(() => {
        cy.callFirestore('set', `medications/${medicationId}`, {
            medicationId: medicationId,
            uid: testUid,
            email: testEmail,
            name: 'Doliprane 1000mg',
            quantity: 10, // Starting quantity
            expiryDate: new Date('2026-12-31').toISOString(),
        });
    })
    it('should decrement the quantity when the minus button is clicked', () => {
        cy.visit('/medications');

        // Wait for card and initial state
        cy.get('[data-cy="medication-card"]', { timeout: 10000 }).should('contain', '10')

        cy.get('[data-cy="decrement-button"]').click()

        // FIX: Wait for the specific text "9" to appear inside the card
        cy.get('[data-cy="medication-card"]').should('contain', '9');
    });
});