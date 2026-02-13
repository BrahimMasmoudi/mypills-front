import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { FirestoreConnector } from '../adapters/connectors/firestore-connector'

// Ensure we only initialize once
if (getApps().length === 0) {
    initializeApp()
}

export const $firestore = getFirestore()
export const $storage = getStorage()

export const $firebaseConnector = new FirestoreConnector($firestore)
