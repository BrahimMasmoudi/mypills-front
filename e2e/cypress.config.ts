import { defineConfig } from 'cypress'
import { plugin as cypressFirebasePlugin } from 'cypress-firebase'
import admin from 'firebase-admin'

export default defineConfig({
    e2e: {
        baseUrl: process.env.CYPRESS_BASE_URL ?? 'http://localhost:3000',
        supportFile: './support/e2e.ts',
        specPattern: 'tests/**/*.cy.{js,jsx,ts,tsx}',
        env: {
            GCLOUD_PROJECT: 'my-pills-staging-460b5'
        },
        setupNodeEvents(on, config) {
            const projectId = 'my-pills-staging-460b5'
            const isLocal = config.baseUrl!.includes('localhost') || config.baseUrl!.includes('127.0.0.1')

            if (isLocal) {
                process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
                process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
            } else {
                // IMPORTANT: Clear emulator variables so Admin SDK goes to the Cloud
                delete process.env.FIREBASE_AUTH_EMULATOR_HOST
                delete process.env.FIRESTORE_EMULATOR_HOST
            }

            // Initialize Admin SDK with the Service Account on Staging
            if (admin.apps.length === 0) {
                const serviceAccount = process.env.CYPRESS_FIREBASE_SERVICE_ACCOUNT
                    ? JSON.parse(process.env.CYPRESS_FIREBASE_SERVICE_ACCOUNT)
                    : undefined

                admin.initializeApp({
                    projectId: projectId,
                    // If we have a service account (on Staging), use it.
                    // If not (Local), it will fallback to emulator behavior.
                    credential: serviceAccount ? admin.credential.cert(serviceAccount) : undefined
                })
            }

            return cypressFirebasePlugin(on, config, admin)
        },
    },
})