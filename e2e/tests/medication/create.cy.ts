describe('Medication Management', () => {
    it('should create a new medication successfully', () => {
        cy.visit('/')
        cy.get('.v-fab__container > .v-btn', { timeout: 15000 }).should('be.visible').click()
        cy.get('[data-cy="add-medication-button"]').click()

        cy.get('[data-cy="medication-name-input"] input').type('Doliprane 1000mg{enter}')
        cy.get('[data-cy="packages-input"] input').clear().type('2')
        cy.get('[data-cy="pills-per-box-input"] input').clear().type('4')

        cy.get('[data-cy="confirm-create-button"]').click()

        // FIX: Explicitly wait for the dialog to be removed from DOM
        // Allow sufficient headroom for Cloud Functions emulator cold start
        cy.get('[data-cy="create-medication-dialog"]', { timeout: 20000 }).should('not.exist')

        cy.contains('Doliprane 1000mg').should('be.visible')
        cy.contains('8').should('be.visible')
    })
})