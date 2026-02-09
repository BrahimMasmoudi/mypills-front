
// Special overrides for tests to ensure they point to emulator
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || 'my-pills-staging-460b5';

if (!process.env.GITHUB_ACTIONS) {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
}
