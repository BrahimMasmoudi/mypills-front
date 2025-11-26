
import type { Firestore } from '@firebase/firestore/lite'
import type { Functions } from '@firebase/functions'
import {
    type Analytics,
} from '@firebase/analytics'
import { connectFunctionsEmulator, getFunctions } from "@firebase/functions";
import { useFirebaseApp, useFirestore } from 'vuefire'
import { type FirebaseOptions, initializeApp } from '@firebase/app'

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
    const { functions: functionsConfig, firestore: firestoreConfig } = $config.public.firebase

    const { data } = await useFetch<FirebaseOptions>('/__/firebase/init.json')
    if (!data.value) {
        return
    }
    const firebaseApp = initializeApp(data.value)


    if (firestoreConfig.enable) {
        // useFirestore() returns the existing Firestore instance, potentially already connected to emulators by nuxt-vuefire
        const firestoreInstance = useFirestore()

        // If nuxt-vuefire didn't connect to emulators (e.g. if it didn't detect them), we could do it here.
        // But usually it does. If we want to be safe and force it based on our config:
        // Note: connectFirestoreEmulator can be called multiple times? No, usually throws if already initialized/connected.
        // So we should rely on nuxt-vuefire's auto-detection or configuration.

        provide('firestore', firestoreInstance)
    }

    if (functionsConfig.enable) {
        // functions usually need region
        const functionsInstance = getFunctions(firebaseApp, functionsConfig.location || 'us-central1')

        if (functionsConfig.enableEmulator) {
            // Check if already connected? Hard to check. 
            // But if we use getFunctions, we get the instance. 
            // If nuxt-vuefire handles functions, it might have already connected.
            // Let's try to connect only if we are sure. 
            // Actually, nuxt-vuefire module config doesn't seem to have explicit functions emulator config in the user's nuxt.config.ts
            // So we might need to connect it here.
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
})