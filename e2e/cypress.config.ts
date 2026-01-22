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
            const isLocal = config.baseUrl!.includes('localhost') || config.baseUrl!.includes('127.0.0.1')

            if (isLocal) {
                process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
                process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
            }

            process.env.GCLOUD_PROJECT = config.env.GCLOUD_PROJECT

            if (admin.apps.length === 0) {
                admin.initializeApp({
                    projectId: config.env.GCLOUD_PROJECT,
                })
            }

            return cypressFirebasePlugin(on, config, admin)
        }
    },
})