import { defineConfig } from 'cypress'
import { plugin as cypressFirebasePlugin } from 'cypress-firebase'
import admin from 'firebase-admin'

export default defineConfig({
    e2e: {
        baseUrl: process.env.CYPRESS_BASE_URL ?? 'http://localhost:3000',
        supportFile: './support/e2e.ts',
        specPattern: 'tests/**/*.cy.{js,jsx,ts,tsx}',
        numTestsKeptInMemory: 0,
        experimentalMemoryManagement: true,
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
                delete process.env.FIREBASE_AUTH_EMULATOR_HOST
                delete process.env.FIRESTORE_EMULATOR_HOST
            }

            process.env.GCLOUD_PROJECT = projectId

            if (admin.apps.length === 0) {
                let credential;
                const saEnv = process.env.CYPRESS_FIREBASE_SERVICE_ACCOUNT || process.env.SERVICE_ACCOUNT;

                if (saEnv) {
                    try {
                        // Handle both stringified JSON and potential raw objects
                        const serviceAccount = typeof saEnv === 'string' ? JSON.parse(saEnv) : saEnv;
                        credential = admin.credential.cert(serviceAccount);
                    } catch (e) {
                        console.error("Cypress Config: Failed to parse Service Account JSON", e);
                    }
                }

                admin.initializeApp({
                    projectId: projectId,
                    // Only include credential if it was successfully created
                    ...(credential ? { credential } : {})
                })
            }

            return cypressFirebasePlugin(on, config, admin)
        },
    },
})