describe('Medication Management', () => {
    beforeEach(() => {
        cy.callFirestore('get', 'medications', {where: [['email', '==', 'test.test@test.com']]}).then((medications) => {
            if (medications) {
                medications.forEach((med: any) => {
                    cy.callFirestore('delete', `medications/${med.medicationId}`)
                })
            }
        })
    })

    it('should create a new medication successfully', () => {
        cy.visit('/')
        cy.url().should('include', '/medications')

        cy.get('.v-fab__container > .v-btn').should('be.visible').click()
        cy.get('[data-cy="add-medication-button"]').should('be.visible').click()
        cy.get('[data-cy="create-medication-dialog"]').should('be.visible')

        cy.get('[data-cy="medication-name-input"]')
            .find('input')
            .type('Doliprane 1000mg{enter}')

        cy.get('[data-cy="quantity-input"]')
            .find('input')
            .clear()
            .type('3')

        cy.get('[data-cy="expiry-date-input"]').should('have.value', '')
        cy.get('[data-cy="confirm-create-button"]').should('not.be.disabled').click()

        cy.get('[data-cy="create-medication-dialog"]').should('not.exist')

        cy.contains('Doliprane 1000mg').should('be.visible')
        cy.contains('3').should('be.visible')
    })
})