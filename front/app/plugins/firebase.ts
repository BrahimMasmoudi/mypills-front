import type {Firestore} from '@firebase/firestore/lite'
import type {Functions} from '@firebase/functions'
import {
    type Analytics,
} from '@firebase/analytics'
import {initializeApp} from "@firebase/app"
import {connectFunctionsEmulator, getFunctions} from "@firebase/functions";

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

export default defineNuxtPlugin(async ({provide, $config}) => {
    const {functions} = $config.public.firebase
    const {data} = await useFetch('/__/firebase/init.json')

    const firebaseApp = initializeApp(data.value as any)

    // const baseURL = functions.enableEmulator
    //     ? `http://${functions.emulatorHost}:${functions.emulatorPort}/${firebaseApp.options.projectId}/europe-west3`
    //     : `https://europe-west3-${firebaseApp.options.projectId}.cloudfunctions.net`
    // provide('functionsURL', baseURL)

    // Functions
    if (functions.enable) {
        const functionsInstance = getFunctions(firebaseApp, 'us-central1')
        connectFunctionsEmulator(
            functionsInstance,
            functions.emulatorHost,
            functions.emulatorPort
        )
        provide('functions', functionsInstance)
    }
})