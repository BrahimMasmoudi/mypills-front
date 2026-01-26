describe('Medication Management', () => {
    it('should create a new medication successfully', () => {
        cy.visit('/')
        cy.get('.v-fab__container > .v-btn', { timeout: 15000 }).should('be.visible').click()
        cy.get('[data-cy="add-medication-button"]').click()

        cy.get('[data-cy="medication-name-input"] input').type('Doliprane 1000mg{enter}')
        cy.get('[data-cy="quantity-input"] input').clear().type('3')

        cy.get('[data-cy="confirm-create-button"]').click()

        // FIX: Explicitly wait for the dialog to be removed from DOM
        // Increase timeout to 10s for Staging latency
        cy.get('[data-cy="create-medication-dialog"]', { timeout: 10000 }).should('not.exist')

        cy.contains('Doliprane 1000mg').should('be.visible')
        cy.contains('3').should('be.visible')
    })
})