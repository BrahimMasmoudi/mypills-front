describe('Medication Barcode Lookup Fallback', () => {
    it('preserves scanned barcode and saves manual entry when external API fails', () => {
        cy.visit('/')

        cy.intercept('POST', '**/getMedicationDetails*', {
            statusCode: 503,
            body: {
                error: {
                    status: 'UNAVAILABLE',
                    message: 'External medication service unavailable',
                },
            },
        }).as('getMedicationDetails')

        cy.get('.v-fab__container > .v-btn', { timeout: 15000 }).should('be.visible').click()
        cy.get('[data-cy="add-medication-button"]').click()

        cy.window().then((win) => {
            (win as unknown as { __E2E_BARCODE__?: string }).__E2E_BARCODE__ = '010340093595583817281231'
        })

        cy.get('[data-cy="scan-barcode-button"]').click()
        cy.wait('@getMedicationDetails')
        cy.get('[data-cy="queue-toast-error"]', { timeout: 10000 }).should('be.visible')

        cy.get('[data-cy="medication-name-input"] input').type('Custom Fallback Med')
        cy.get('[data-cy="custom-medication-option"]').should('be.visible').click()
        cy.get('[data-cy="confirm-create-button"]').click()

        cy.get('[data-cy="create-medication-dialog"]', { timeout: 20000 }).should('not.exist')
        cy.contains('Custom Fallback Med').should('be.visible')

        cy.callFirestore('get', 'medications', {
            where: [['name', '==', 'Custom Fallback Med']],
        }).then((docs: Array<{ bareCode?: string }>) => {
            expect(docs).to.have.length(1)
            expect(docs[0]?.bareCode).to.equal('3400935955838')
        })
    })
})
