import { defineConfig } from 'cypress'
import { plugin as cypressFirebasePlugin } from 'cypress-firebase'
import admin from 'firebase-admin'

export default defineConfig({
    e2e: {
        baseUrl: process.env.CYPRESS_BASE_URL ?? 'http://localhost:3000',
        supportFile: './support/e2e.ts',
        specPattern: 'tests/**/*.cy.{js,jsx,ts,tsx}',
        numTestsKeptInMemory: 0,
        experimentalFastVisibility: true,
        experimentalMemoryManagement: true,
        screenshotOnRunFailure: true,
        defaultCommandTimeout: 30000,
        video: true,
        env: {
            GCLOUD_PROJECT: 'my-pills-staging-460b5',
            FIREBASE_APPCHECK_DEBUG_TOKEN: process.env.CYPRESS_FIREBASE_APPCHECK_DEBUG_TOKEN
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
                let credential
                const saEnv = process.env.CYPRESS_FIREBASE_SERVICE_ACCOUNT || process.env.SERVICE_ACCOUNT

                if (saEnv) {
                    try {
                        // Handle both stringified JSON and potential raw objects
                        const serviceAccount = typeof saEnv === 'string' ? JSON.parse(saEnv) : saEnv
                        credential = admin.credential.cert(serviceAccount)
                    } catch (e) {
                        console.error("Cypress Config: Failed to parse Service Account JSON", e)
                    }
                }

                admin.initializeApp({
                    projectId: projectId,
                    storageBucket: 'my-pills-staging-460b5.firebasestorage.app',
                    // Only include credential if it was successfully created
                    ...(credential ? { credential } : {})
                })
            }

            on('before:browser:launch', (browser, launchOptions) => {
                if (browser.name === 'chrome' || browser.name === 'chromium') {
                    // High-level memory management
                    launchOptions.args.push('--js-flags=--max-old-space-size=3500')
                    launchOptions.args.push('--disable-dev-shm-usage')
                    launchOptions.args.push('--disable-gpu')
                    launchOptions.args.push('--no-sandbox')

                    // These two help specifically with "Renderer Process Crashed"
                    launchOptions.args.push('--disable-renderer-backgrounding')
                    launchOptions.args.push('--disable-background-timer-throttling')
                }
                return launchOptions
            })

            on('task', {
                async resetUserMedications(email: string) {
                    const db = admin.firestore()
                    const snapshot = await db.collection('medications')
                        .where('email', '==', email)
                        .get()

                    const batch = db.batch()
                    snapshot.docs.forEach((doc) => batch.delete(doc.ref))
                    await batch.commit()
                    return null
                },

                async deleteUserFolder({ uid, folderName }: { uid: string, folderName: string }) {
                    const bucket = admin.storage().bucket()
                    const prefix = `users/${uid}/${folderName}/`

                    try {
                        const [files] = await bucket.getFiles({ prefix })
                        if (files.length > 0) {
                            await Promise.all(files.map(file => file.delete()))
                        }
                    } catch (error) {
                        console.error('Error deleting folder:', error)
                    }
                    return null
                }
            })


            return cypressFirebasePlugin(on, config, admin)
        },
    },
})