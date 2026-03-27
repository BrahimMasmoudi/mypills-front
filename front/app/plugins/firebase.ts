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
import { useFirebaseApp, useFirestore, getCurrentUser, useFirebaseStorage } from 'vuefire'
import { getMessaging } from 'firebase/messaging'
import { onAuthStateChanged } from 'firebase/auth'
import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider } from 'firebase/app-check'
import { useUserStore } from '~/store/userStore'
import { useFirebaseAuth } from 'vuefire'

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

    if (import.meta.client) {
        const siteKey = import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY || 'dummy-key'
        const isDebug = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN || (window as any).Cypress

        try {
            initializeAppCheck(firebaseApp, {
                provider: isDebug
                    ? new CustomProvider({
                        getToken: () => Promise.resolve({
                            token: typeof isDebug === 'string' ? isDebug : 'placeholder-token',
                            expireTimeMillis: Date.now() + 3600000
                        })
                    })
                    : new ReCaptchaV3Provider(siteKey),
                isTokenAutoRefreshEnabled: true,
            })
        } catch (e) {
            console.debug('App Check already initialized or failed:', e)
        }
    }

    // Sync Auth State to Pinia for Cypress/Persistence
    const userStore = useUserStore()
    const auth = useFirebaseAuth()
    onAuthStateChanged(auth!, (u) => {
        userStore.user = u ?? undefined
    })

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