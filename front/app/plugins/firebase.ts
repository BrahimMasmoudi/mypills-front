
import type { Firestore } from '@firebase/firestore/lite'
import type { Functions } from '@firebase/functions'
import {
    getAnalytics,
    type Analytics,
} from '@firebase/analytics'
import { connectFunctionsEmulator, getFunctions } from "@firebase/functions";
import { useFirebaseApp, useFirestore } from 'vuefire'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

type RemoteConfig = {}

declare module '#app' {
    interface NuxtApp {
        $firestore: Firestore
        $functions: Functions
        $remoteConfig: RemoteConfig
        $analytics: Analytics
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
    const { functions: functionsConfig, firestore: firestoreConfig, analytics: analyticsConfig } = $config.public.firebase

    const firebaseApp = useFirebaseApp()
    if (firestoreConfig.enable) {
        const firestoreInstance = useFirestore()
        provide('firestore', firestoreInstance)
    }

    if (functionsConfig.enable) {
        // functions usually need region
        const functionsInstance = getFunctions(firebaseApp, functionsConfig.location || 'us-central1')

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

    // Initialize Analytics if enabled
    if (analyticsConfig?.enable) {
        const { getAnalytics, setUserId, setUserProperties } = await import('@firebase/analytics')
        const { getCurrentUser } = await import('vuefire')

        const analyticsInstance = getAnalytics(firebaseApp)

        // Set user ID and properties for analytics tracking
        const user = await getCurrentUser()
        if (user?.uid) {
            setUserId(analyticsInstance, user.uid)
            setUserProperties(analyticsInstance, {
                email: user.email,
                displayName: user.displayName
            })
        }

        provide('analytics', analyticsInstance)
    }
})