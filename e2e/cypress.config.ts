import { defineConfig } from 'cypress'
import { plugin as cypressFirebasePlugin } from 'cypress-firebase'
import admin from 'firebase-admin'

export default defineConfig({
    e2e: {
        // This points back to your Nuxt app running at the root
        baseUrl: 'http://localhost:3000',
        supportFile: './support/e2e.ts',
        specPattern: 'tests/**/*.cy.{js,jsx,ts,tsx}',
        setupNodeEvents(on, config) {
            // 1. Force Admin SDK to look at the local emulator
            process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
            process.env.GCLOUD_PROJECT = 'my-pills-staging-460b5';

            // 2. Initialize Admin with a placeholder for the Emulator
            if (admin.apps.length === 0) {
                admin.initializeApp({
                    projectId: 'my-pills-staging-460b5',
                });
            }

            return cypressFirebasePlugin(on, config, admin);
        },
    },
})