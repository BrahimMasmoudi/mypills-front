import { initializeApp as initAdminApp, getApps as getAdminApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { FirestoreConnector } from '../adapters/connectors/firestore-connector'
import { FirebaseAiConnector } from '../adapters/connectors/firebase-ai-connector'
import { getAI, GoogleAIBackend } from 'firebase/ai'
import { initializeApp as initClientApp, getApps as getClientApps } from 'firebase/app'

const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || ''

if (getAdminApps().length === 0) {
    initAdminApp({ projectId })
}

if (getClientApps().length === 0) {
    initClientApp({ projectId })
}

export const $firestore = getFirestore()
export const $storage = getStorage()
export const $firebaseConnector = new FirestoreConnector($firestore)

const clientApp = getClientApps()[0]
export const $ai = getAI(clientApp, { backend: new GoogleAIBackend() })
export const $aiConnector = new FirebaseAiConnector($ai)
