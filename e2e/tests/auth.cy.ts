describe('Nuxt 3 Auto-Login', () => {
    it('should bypass landing page and go straight to medications', () => {
        cy.login('test-user-123')

        cy.visit('/')

        cy.url().should('include', '/medications')

        cy.get('[data-cy="country-dialog"]').should('be.visible')
    })
})