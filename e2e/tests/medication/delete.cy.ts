describe('Medication Deletion Flow', () => {
    const testEmail = 'test.test@test.com'
    const testUid = 'test-user-123'
    const medicationId = 'med-unique-123'

    beforeEach(() => {
        cy.setCookie('user-country', 'FR')

        cy.authDeleteUser(testUid)

        cy.authCreateUser({
            uid: testUid,
            email: testEmail,
            emailVerified: true,
            displayName: 'Test User'
        })

        cy.login(testUid)

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
                ingredients: [{substance: 'PARACÉTAMOL', dosage: '1000 mg'}]
            }
        }

        cy.callFirestore('set', `medications/${medicationId}`, medicationSeed)
    })

    it('should delete a medication through the UI and reflect in the database', () => {
        cy.visit('/medications')
        cy.get('[data-cy="medication-card"]', {timeout: 10000})
            .should('be.visible')
            .and('contain', 'Doliprane 1000mg')
        cy.get(`[data-cy="delete-pill-button"]`).first().click()
        cy.get('[data-cy="validation-with-warning-dialog"]').should('be.visible')
        cy.get('[data-cy="confirm-deletion-button"]').click()
        cy.callFirestore('get', `medications/${medicationId}`).then((doc) => {
            expect(doc).to.be.null
        })
    })
})