// Special overrides for tests to ensure they point to emulator
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || 'my-pills-staging-460b5'
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-key'
