import type { FirebaseApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore'
import { connectStorageEmulator, getStorage } from 'firebase/storage'
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
import {
    getCurrentUser,
    useFirebaseApp,
    useFirebaseAuth,
    useFirebaseStorage,
    useFirestore,
} from 'vuefire'
import { getMessaging } from 'firebase/messaging'
import { connectAuthEmulator, onAuthStateChanged } from 'firebase/auth'
import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider } from 'firebase/app-check'
import { useUserStore } from '~/store/userStore'

const connectedEmulatorApps = new WeakSet<FirebaseApp>()

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
        useEmulators,
        authEmulatorUrl,
        firestoreEmulatorHost,
        firestoreEmulatorPort,
        storageEmulatorHost,
        storageEmulatorPort,
        functions: functionsConfig,
        analytics: analyticsConfig,
    } = $config.public.firebase

    const firebaseApp = useFirebaseApp()

    if (import.meta.client) {
        const siteKey = import.meta.env.VITE_FIREBASE_APP_CHECK_SITE_KEY || 'dummy-key'
        const windowDebugToken = (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN
        const envDebugToken = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN
        const isCypress = (window as any).Cypress

        if (windowDebugToken || envDebugToken || isCypress) {
            try {
                initializeAppCheck(firebaseApp, {
                    provider: new CustomProvider({
                        getToken: () => {
                            const debugToken = (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN
                                || import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN
                                || 'placeholder-token'
                            return Promise.resolve({
                                token: debugToken,
                                expireTimeMillis: Date.now() + 3600000
                            })
                        }
                    }),
                    isTokenAutoRefreshEnabled: true,
                })
            } catch (e) {
                console.debug('App Check already initialized or failed:', e)
            }
        } else {
            try {
                initializeAppCheck(firebaseApp, {
                    provider: new ReCaptchaV3Provider(siteKey),
                    isTokenAutoRefreshEnabled: true,
                })
            } catch (e) {
                console.debug('App Check already initialized or failed:', e)
            }
        }
    }

    // Connect emulators before any Firestore/Storage composable triggers listeners or RPCs
    const userStore = useUserStore()
    const auth = useFirebaseAuth()

    if (useEmulators && !connectedEmulatorApps.has(firebaseApp)) {
        connectedEmulatorApps.add(firebaseApp)
        if (auth) {
            connectAuthEmulator(auth, authEmulatorUrl)
        }
        let emulatorFirestore: Firestore
        try {
            emulatorFirestore = initializeFirestore(firebaseApp, {
                experimentalForceLongPolling: true,
            })
        } catch {
            emulatorFirestore = getFirestore(firebaseApp)
        }
        connectFirestoreEmulator(
            emulatorFirestore,
            firestoreEmulatorHost,
            firestoreEmulatorPort
        )
        connectStorageEmulator(
            getStorage(firebaseApp),
            storageEmulatorHost,
            storageEmulatorPort
        )
    }

    const firestoreInstance = useFirestore()
    const storageInstance = useFirebaseStorage()

    onAuthStateChanged(auth!, async (u) => {
        userStore.user = u ?? undefined
        if (u) {
            await userStore.saveUserProfile(u)
        }
    })

    provide('firestore', firestoreInstance)
    provide('storage', storageInstance)

    if (functionsConfig.enable) {
        const functionsInstance = getFunctions(firebaseApp, 'europe-west3')
        if (useEmulators) {
            connectFunctionsEmulator(
                functionsInstance,
                functionsConfig.emulatorHost,
                functionsConfig.emulatorPort
            )
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