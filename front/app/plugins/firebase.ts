import type { Firestore } from '@firebase/firestore/lite'
import type { Functions } from '@firebase/functions'
import type { Messaging } from '@firebase/messaging'
import {
    getAnalytics,
    type Analytics,
    setUserId,
    setUserProperties,
} from '@firebase/analytics'
import { connectFunctionsEmulator, getFunctions } from '@firebase/functions'
import { useFirebaseApp, useFirestore, getCurrentUser } from 'vuefire'
import { getMessaging } from 'firebase/messaging'

type RemoteConfig = Record<string, any>

declare module '#app' {

    interface NuxtApp {
        $firestore: Firestore
        $functions: Functions
        $remoteConfig: RemoteConfig
        $analytics: Analytics
        $messaging: Messaging
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $firestore: Firestore
        $remoteConfig: RemoteConfig
        $functions: Functions
        $analytics: Analytics
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $firestore: Firestore
        $remoteConfig: RemoteConfig
        $functions: Functions
        $analytics: Analytics
    }
}

export default defineNuxtPlugin(async ({ provide, $config }) => {
    const {
        functions: functionsConfig,
        firestore: firestoreConfig,
        analytics: analyticsConfig,
    } = $config.public.firebase

    const firebaseApp = useFirebaseApp()
    if (firestoreConfig.enable) {
        const firestoreInstance = useFirestore()
        provide('firestore', firestoreInstance)
    }

    if (functionsConfig.enable) {
        const functionsInstance = getFunctions(firebaseApp, 'europe-west3')

        if (functionsConfig.enableEmulator) {
            try {
                connectFunctionsEmulator(
                    functionsInstance,
                    functionsConfig.emulatorHost || '127.0.0.1',
                    functionsConfig.emulatorPort || 5001
                )
            } catch (e) {
                // Ignore if already connected
                console.warn('Failed to connect functions emulator (maybe already connected):', e)
            }
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
