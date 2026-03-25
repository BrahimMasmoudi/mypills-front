import type { Firestore } from '@firebase/firestore/lite'
import type { Functions } from '@firebase/functions'
import type { Messaging } from '@firebase/messaging'
import type { FirebaseStorage } from '@firebase/storage'
import {
    getAnalytics,
    type Analytics,
    setUserId,
    setUserProperties,
} from '@firebase/analytics'
import { connectFunctionsEmulator, getFunctions } from '@firebase/functions'
import { useFirebaseApp, useFirestore, getCurrentUser } from 'vuefire'
import { getMessaging } from 'firebase/messaging'

// Enable App Check debug token in non-production environments.
// Set FIREBASE_APP_CHECK_DEBUG_TOKEN in your .env to avoid all requests
// being reported as invalid in the Firebase console.
if (import.meta.client && process.env.NODE_ENV !== 'production') {
    // @ts-ignore
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.FIREBASE_APPCHECK_DEBUG_TOKEN ?? true
}

type RemoteConfig = Record<string, any>

declare module '#app' {
    interface NuxtApp {
        $firestore: Firestore
        $functions: Functions
        $storage: FirebaseStorage
        $remoteConfig: RemoteConfig
        $analytics: Analytics
        $messaging: Messaging
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $firestore: Firestore
        $functions: Functions
        $storage: FirebaseStorage
        $remoteConfig: RemoteConfig
        $analytics: Analytics
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $firestore: Firestore
        $functions: Functions
        $storage: FirebaseStorage
        $remoteConfig: RemoteConfig
        $analytics: Analytics
    }
}

export default defineNuxtPlugin(async ({ provide, $config }) => {
    const {
        functions: functionsConfig,
        analytics: analyticsConfig,
    } = $config.public.firebase

    const firebaseApp = useFirebaseApp()

    const firestoreInstance = useFirestore()
    const storageInstance = useFirebaseStorage()

    provide('firestore', firestoreInstance)
    provide('storage', storageInstance)

    if (functionsConfig.enable) {
        const functionsInstance = getFunctions(firebaseApp, 'europe-west3')
        if (functionsConfig.enableEmulator) {
            connectFunctionsEmulator(functionsInstance, '127.0.0.1', 5001)
        }
        provide('functions', functionsInstance)
    }

    const user = await getCurrentUser()

    if (analyticsConfig?.enable) {
        const analyticsInstance = getAnalytics(firebaseApp)

        if (user?.uid) {
            setUserId(analyticsInstance, user.uid)
            setUserProperties(analyticsInstance, {
                email: user.email,
                displayName: user.displayName,
            })
        }

        provide('analytics', analyticsInstance)
    }

    if (import.meta.client) {
        try {
            const messaging = getMessaging(firebaseApp)
            provide('messaging', messaging)
        } catch (e) {
            console.error('Messaging init failed:', e)
        }
    }
})