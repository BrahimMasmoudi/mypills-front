import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { FirestoreConnector } from '../adapters/connectors/firestore-connector'
import { FirebaseAiConnector } from '../adapters/connectors/firebase-ai-connector'
import { getAI, GoogleAIBackend } from 'firebase/ai'
import { initializeApp as initClientApp, getApps as getClientApps } from 'firebase/app'

// Ensure we only initialize once
if (getApps().length === 0) {
    initializeApp()
}

export const $firestore = getFirestore()
export const $storage = getStorage()
export const $firebaseConnector = new FirestoreConnector($firestore)

const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || ''
const clientAppName = 'advisor-adapter-app'
const clientApp = getClientApps().find(a => a.name === clientAppName) || initClientApp({ projectId }, clientAppName)

export const $ai = getAI(clientApp, { backend: new GoogleAIBackend() })
export const $aiConnector = new FirebaseAiConnector($ai)
