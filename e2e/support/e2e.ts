import {attachCustomCommands} from 'cypress-firebase'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

declare global {
    namespace Cypress {
        interface Chainable {
            setupTestUser(): Chainable<null>

        }
    }
}

const fbConfig = {
    "apiKey": "AIzaSyD8L9ygNvkH0FO46dceDGmneRwQ7WuaFBk",
    "authDomain": "my-pills-staging-460b5.firebaseapp.com",
    "projectId": "my-pills-staging-460b5",
    "storageBucket": "my-pills-staging-460b5.firebasestorage.app",
    "messagingSenderId": "824429090964",
    "appId": "1:824429090964:web:7e0cb8ae45c2424b8afc81",
    "measurementId": "G-SBR5TS02DD"
}

const app = firebase.apps.length === 0
    ? firebase.initializeApp(fbConfig)
    : firebase.app()

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

if (isLocal) {
    app.auth().useEmulator('http://localhost:9099')
    app.firestore().useEmulator('localhost', 8080)
    console.log('Cypress is using Firebase Emulators')
} else {
    console.log('Cypress is using Live Staging Firebase')
}

attachCustomCommands({Cypress, cy, firebase})


export const testEmail = 'test.test@test.com'
export const testUid = 'test-user-123'
export const medicationId = 'med-unique-123'

Cypress.Commands.add('setupTestUser', () => {
    cy.setCookie('user-country', 'FR')

    cy.task('resetUserMedications', testEmail)
    cy.authDeleteUser(testUid)

    cy.authCreateUser({
        uid: testUid,
        email: testEmail,
        emailVerified: true,
        displayName: 'Test User'
    })
    cy.login(testUid)
})

before(() => {
    cy.setupTestUser()
})