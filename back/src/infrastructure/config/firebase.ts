import {initializeApp, getApps} from 'firebase-admin/app'
import {getFirestore} from 'firebase-admin/firestore'

// Ensure we only initialize once
if (getApps().length === 0) {
    initializeApp()
}

export const $firestore = getFirestore()