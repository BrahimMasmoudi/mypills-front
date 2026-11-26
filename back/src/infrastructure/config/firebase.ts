import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { FirestoreConnector } from '../adapters/connectors/firestore-connector'
import { GoogleGenAI } from '@google/genai'
import { GoogleAiConnector } from '../adapters/connectors/google-ai-connector'

const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || ''

if (getApps().length === 0) {
    initializeApp({ projectId })
}

export const $firestore = getFirestore()
export const $storage = getStorage()
export const $firebaseConnector = new FirestoreConnector($firestore)

const geminiKey = process.env.GEMINI_API_KEY || ''
export const $ai = new GoogleGenAI({ apiKey: geminiKey })

export const $aiConnector = new GoogleAiConnector($ai)
