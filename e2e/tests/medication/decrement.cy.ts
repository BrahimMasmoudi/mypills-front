describe('Medication Quantity Updates', () => {
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

        cy.callFirestore('get', 'medications', {where: [['email', '==', 'test.test@test.com']]}).then((medications) => {
            if (medications) {
                medications.forEach((med: any) => {
                    cy.callFirestore('delete', `medications/${med.medicationId}`)
                })
            }
        })

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

        cy.get('[data-cy="medication-card"]', {timeout: 10000})
            .should('be.visible')
            .and('contain', '10')

        cy.get('[data-cy="decrement-button"]')
            .click()

        // 3. Assert UI update
        cy.contains('9').should('be.visible');
    });
});